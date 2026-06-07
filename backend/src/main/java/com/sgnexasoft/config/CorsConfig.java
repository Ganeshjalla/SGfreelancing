package com.sgnexasoft.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${FRONTEND_URL:*}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {
        var config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Allow localhost dev + any Vercel/Render production URL
        // NOTE: "*" cannot be combined with allowCredentials=true (CORS spec violation).
        // Using specific patterns instead.
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "http://localhost:80",
            "http://localhost",
            "https://*.vercel.app",
            "https://*.onrender.com",
            frontendUrl
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setMaxAge(3600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
