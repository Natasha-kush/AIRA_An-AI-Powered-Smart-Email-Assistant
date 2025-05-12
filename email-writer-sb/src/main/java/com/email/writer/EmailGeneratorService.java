package com.email.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String getGeminiApiKey;

    // WebClient constructor
    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    // Existing reply method — left unchanged
    public String generateEmailReply(EmailRequest emailRequest) {
        String prompt = buildPrompt(emailRequest);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl + getGeminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponseContent(response);
    }

    // ✅ NEW: Handle composing a fresh email based on prompt
    public String generateEmailFromPrompt(String prompt, String tone, String language) {
        StringBuilder fullPrompt = new StringBuilder();

        if (language != null && !language.equalsIgnoreCase("none")) {
            fullPrompt.append("Write the email in ").append(language).append(". ");
        }

        if (tone != null && !tone.equalsIgnoreCase("none")) {
            fullPrompt.append("Use a ").append(tone).append(" tone. ");
        }

        fullPrompt.append("Compose an email based on the following prompt: ").append(prompt);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", fullPrompt.toString())
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl + getGeminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractResponseContent(response);
    }

    // Shared response extraction logic
    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    // Shared prompt builder for reply flow
    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();

        // Start with a clear instruction for the reply format
        prompt.append("Generate an email reply with the following style:\n");

        // Add tone to the style (don't include the tone explicitly in the reply text)
        if (emailRequest.getTone() != null && !emailRequest.getTone().equalsIgnoreCase("none")) {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }

        // Add language to the prompt if provided (but it won't appear in the response)
        if (emailRequest.getLanguage() != null && !emailRequest.getLanguage().equalsIgnoreCase("none")) {
            prompt.append(" Write it in ").append(emailRequest.getLanguage());
        }

        // Now, append the original email content that needs to be replied to
        prompt.append("\nOriginal email content:\n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}
