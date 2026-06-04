package com.sgnexasoft;

import java.io.IOException;
import java.net.ServerSocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SgnexasoftApplication {
    private static final String DEFAULT_DATASOURCE_URL = "jdbc:h2:mem:sgnexasoftdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
    private static final int DEFAULT_SERVER_PORT = 8082;
    private static final int MAX_PORT_TRY = 8092;

    public static void main(String[] args) {
        sanitizeDatasourceUrl();
        configureServerPort(args);
        SpringApplication.run(SgnexasoftApplication.class, args);
    }

    private static void sanitizeDatasourceUrl() {
        String envUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (isInvalidDatasourceUrl(envUrl)) {
            System.err.println("Invalid SPRING_DATASOURCE_URL placeholder detected. Falling back to local default datasource URL.");
            System.setProperty("SPRING_DATASOURCE_URL", DEFAULT_DATASOURCE_URL);
            System.setProperty("spring.datasource.url", DEFAULT_DATASOURCE_URL);
        }
    }

    private static void configureServerPort(String[] args) {
        if (hasServerPortOverride(args)) {
            return;
        }

        if (System.getenv("SERVER_PORT") != null || System.getProperty("server.port") != null) {
            return;
        }

        int port = findAvailablePort(DEFAULT_SERVER_PORT, MAX_PORT_TRY);
        if (port != DEFAULT_SERVER_PORT) {
            System.err.println("Port " + DEFAULT_SERVER_PORT + " is unavailable. Using fallback port " + port + ".");
        }
        System.setProperty("server.port", String.valueOf(port));
    }

    private static boolean hasServerPortOverride(String[] args) {
        if (args == null) {
            return false;
        }
        for (String arg : args) {
            if (arg != null && arg.startsWith("--server.port=")) {
                return true;
            }
        }
        return false;
    }

    private static int findAvailablePort(int startPort, int maxPort) {
        for (int port = startPort; port <= maxPort; port++) {
            if (isPortAvailable(port)) {
                return port;
            }
        }
        return 0;
    }

    private static boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket(port)) {
            socket.setReuseAddress(true);
            return true;
        } catch (IOException ignored) {
            return false;
        }
    }

    private static boolean isInvalidDatasourceUrl(String url) {
        return url != null && (url.contains("<HOST>") || url.contains("<PORT>") || url.trim().isEmpty());
    }
}
