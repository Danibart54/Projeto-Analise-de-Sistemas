package com.extensflow.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {
    private int           status;
    private String        error;
    private String        message;
    private LocalDateTime timestamp;
    private List<String>  details;

    public ErrorResponse(int status, String error, String message,
                         LocalDateTime timestamp, List<String> details) {
        this.status    = status;
        this.error     = error;
        this.message   = message;
        this.timestamp = timestamp;
        this.details   = details;
    }

    public int            getStatus()    { return status; }
    public String         getError()     { return error; }
    public String         getMessage()   { return message; }
    public LocalDateTime  getTimestamp() { return timestamp; }
    public List<String>   getDetails()   { return details; }
}
