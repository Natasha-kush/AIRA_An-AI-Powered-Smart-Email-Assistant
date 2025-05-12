package com.email.writer;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest) {
        String response;

        // If a prompt is provided, compose a new email; otherwise, generate a reply
        if (emailRequest.getPrompt() != null && !emailRequest.getPrompt().isBlank()) {
            response = emailGeneratorService.generateEmailFromPrompt(
                    emailRequest.getPrompt(),
                    emailRequest.getTone(),
                    emailRequest.getLanguage()
            );
        } else {
            response = emailGeneratorService.generateEmailReply(emailRequest);
        }

        return ResponseEntity.ok(response);
    }
}
