package com.ocado.library.notification;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class SlackClient {

    private static final Logger log = LoggerFactory.getLogger(SlackClient.class);

    private final NotificationProperties properties;
    private final RestClient restClient;

    public SlackClient(NotificationProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl("https://slack.com/api")
                .build();
    }

    public Optional<String> lookupUserIdByEmail(String email) {
        if (!isConfigured()) {
            return Optional.empty();
        }
        try {
            JsonNode body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/users.lookupByEmail")
                            .queryParam("email", email)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, bearer())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null || !body.path("ok").asBoolean(false)) {
                String error = body != null ? body.path("error").asText("unknown") : "empty_response";
                log.warn("Slack users.lookupByEmail failed for {}: {}", email, error);
                return Optional.empty();
            }
            return Optional.ofNullable(body.path("user").path("id").asText(null));
        } catch (RestClientException ex) {
            log.warn("Slack users.lookupByEmail request failed for {}: {}", email, ex.getMessage());
            return Optional.empty();
        }
    }

    public boolean postDirectMessage(String slackUserId, String text) {
        if (!isConfigured()) {
            return false;
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("channel", slackUserId);
        form.add("text", text);

        try {
            JsonNode body = restClient.post()
                    .uri("/chat.postMessage")
                    .header(HttpHeaders.AUTHORIZATION, bearer())
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);

            if (body == null || !body.path("ok").asBoolean(false)) {
                String error = body != null ? body.path("error").asText("unknown") : "empty_response";
                log.warn("Slack chat.postMessage failed for channel {}: {}", slackUserId, error);
                return false;
            }
            return true;
        } catch (RestClientException ex) {
            log.warn("Slack chat.postMessage request failed: {}", ex.getMessage());
            return false;
        }
    }

    public boolean isConfigured() {
        NotificationProperties.Slack slack = properties.getSlack();
        return slack.isEnabled()
                && slack.getBotToken() != null
                && !slack.getBotToken().isBlank();
    }

    private String bearer() {
        return "Bearer " + properties.getSlack().getBotToken().trim();
    }
}
