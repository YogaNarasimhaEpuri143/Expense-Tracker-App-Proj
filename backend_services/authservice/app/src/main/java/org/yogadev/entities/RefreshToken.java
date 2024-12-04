package org.yogadev.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonProperty(value = "token_id")
    private Long id;

    @JsonProperty(value = "token")
    private String token;

    @JsonProperty(value = "expiry_date")
    private Date expiryDate;

    @OneToOne
    @JoinColumn(name = "id", referencedColumnName = "user_id") // Foreign Key
    @JsonProperty(value = "user_id")
    private UserInfo userInfo;
}
