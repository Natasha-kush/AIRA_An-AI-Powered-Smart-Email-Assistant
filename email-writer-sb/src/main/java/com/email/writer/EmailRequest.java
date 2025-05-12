package com.email.writer;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
    private String language;
    private String prompt;
}
