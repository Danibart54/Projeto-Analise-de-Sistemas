package com.extensflow.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " não encontrado(a): id=" + id);
    }
}
