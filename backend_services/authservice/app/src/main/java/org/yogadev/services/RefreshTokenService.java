package org.yogadev.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.yogadev.entities.RefreshToken;
import org.yogadev.entities.UserInfo;
import org.yogadev.repository.RefreshTokenRespository;
import org.yogadev.repository.UserRepository;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRespository refreshTokenRespository;
    private final UserRepository userRepository;

    public RefreshToken createRefreshToken(String username){
        UserInfo userInfo = userRepository.findByUserName(username);
        RefreshToken refreshToken = RefreshToken.builder()
                .userInfo(userInfo)
                .expiryDate(new Date(System.currentTimeMillis() + 600000))
                .token(UUID.randomUUID().toString())
                .build();
        refreshTokenRespository.save(refreshToken);

        return refreshToken;
    }

    public RefreshToken verifyExpiration(RefreshToken token){
        if(token.getExpiryDate().before(new Date(System.currentTimeMillis()))){
            refreshTokenRespository.delete(token);
            throw new RuntimeException(token.getToken() + "Refresh Token is expired. Please make a new login...!");
        }
        return token;
    }

    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRespository.findByToken(token);
    }
}
