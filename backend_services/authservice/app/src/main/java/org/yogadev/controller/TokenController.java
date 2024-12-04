package org.yogadev.controller;

import com.mysql.cj.jdbc.Driver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.yogadev.entities.RefreshToken;
import org.yogadev.request.AuthRequestDTO;
import org.yogadev.request.RefreshTokenRequestDTO;
import org.yogadev.response.JwtResponseDTO;
import org.yogadev.services.JwtService;
import org.yogadev.services.RefreshTokenService;

@RestController
@RequiredArgsConstructor
public class TokenController {

    private AuthenticationManager authenticationManager;
    private RefreshTokenService refreshTokenService;
    private JwtService jwtService;

    @PostMapping(path = "/auth/v1/login")
    public ResponseEntity<Object> authenticateAndGetToken(@RequestBody AuthRequestDTO authRequestDTO){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequestDTO.getUsername(), authRequestDTO.getPassword()));

        if(authentication.isAuthenticated()){
            RefreshToken token = refreshTokenService.createRefreshToken(authRequestDTO.getUsername());
            String accessToken = jwtService.generateToken(authRequestDTO.getUsername());
            return new ResponseEntity<>(JwtResponseDTO.builder().accessToken(accessToken).token(token.getToken()).build(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Exception in User Service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/auth/v1/refreshToken")
    public ResponseEntity<JwtResponseDTO> refreshToken(@RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO) {
        return refreshTokenService.findByToken(refreshTokenRequestDTO.getToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserInfo)
                .map(userInfo -> {
                    String accessToken = jwtService.generateToken(userInfo.getUserName());
                    return new ResponseEntity<>(JwtResponseDTO.builder()
                            .accessToken(accessToken)
                            .token(refreshTokenRequestDTO.getToken())
                            .build(), HttpStatus.OK);
                })
                .orElseThrow(() -> new RuntimeException("Refresh Token is not in DB..!!"));
    }
}
