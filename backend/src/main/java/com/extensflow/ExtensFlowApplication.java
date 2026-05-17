package com.extensflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // necessário para RateLimitFilter.limparContadoresExpirados()
public class ExtensFlowApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExtensFlowApplication.class, args);
    }
}
