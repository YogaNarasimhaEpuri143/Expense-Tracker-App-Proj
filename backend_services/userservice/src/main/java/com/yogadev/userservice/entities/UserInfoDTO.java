package com.yogadev.userservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import jakarta.validation.constraints.NotEmpty;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // Telling to ignore the JSON Properties which are not present in this class -> UnrecognizedPropertyException: Unrecognized field "extraField"
public class UserInfoDTO {

    @JsonProperty("user_id") // Explicit mapping for snake_case
    @NonNull
    @NotEmpty
    private String userId;

    @JsonProperty("first_name")
    @NonNull
    @NotEmpty
    private String firstName;

    @JsonProperty("last_name")
    @NonNull
    @NotEmpty
    private String lastName;

    @JsonProperty("phone_number")
    @NonNull
    @NotEmpty
    private String phoneNumber;

    @JsonProperty("email")
    @NonNull
    @NotEmpty
    private String email;

    public UserInfo transformToUserInfo(){
        return UserInfo.builder()
                .firstName(firstName)
                .lastName(lastName)
                .phoneNumber(phoneNumber)
                .email(email)
                .userId(userId)
                .build();
    }

}
