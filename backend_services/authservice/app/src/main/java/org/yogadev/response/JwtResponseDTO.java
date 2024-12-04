package org.yogadev.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponseDTO {

    @JsonProperty(value = "access_token")
    private String accessToken;

    @JsonProperty(value = "token")
    private String token;
}
