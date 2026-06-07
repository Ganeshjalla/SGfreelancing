package com.sgnexasoft;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SgnexasoftApplication {

    public static void main(String[] args) {
        sanitizeDatasourceUrl();
        SpringApplication.run(SgnexasoftApplication.class, args);
    }

    private static void sanitizeDatasourceUrl() {
        String url = System.getenv("SPRING_DATASOURCE_URL");
        if (url != null && (url.contains("<HOST>") || url.contains("<PORT>") || url.isBlank())) {
            System.err.println("[WARN] Invalid SPRING_DATASOURCE_URL detected. Falling back to H2 in-memory database.");
            System.setProperty("SPRING_DATASOURCE_URL", "jdbc:h2:mem:sgnexasoftdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
            System.setProperty("spring.datasource.url", "jdbc:h2:mem:sgnexasoftdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
            System.setProperty("spring.datasource.username", "sa");
            System.setProperty("spring.datasource.password", "");
            System.setProperty("spring.datasource.driver-class-name", "org.h2.Driver");
            System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.H2Dialect");
        }
    }
}
