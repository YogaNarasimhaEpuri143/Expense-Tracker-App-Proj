package org.yogadev.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.yogadev.entities.RefreshToken;
import org.yogadev.models.UserInfoDTO;
import org.yogadev.response.JwtResponseDTO;
import org.yogadev.services.JwtService;
import org.yogadev.services.RefreshTokenService;
import org.yogadev.services.UserDetailsServiceImpl;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsServiceImpl userDetailsService;

    @PostMapping("/auth/v1/signup")
    public ResponseEntity<Object> signUp(@RequestBody UserInfoDTO userInfoDTO){
        try{
            // Present - false
            Boolean signUpUser = userDetailsService.signupUser(userInfoDTO);

            if (!signUpUser){
                return new ResponseEntity<>("User Already Exists", HttpStatus.BAD_REQUEST);
            }

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userInfoDTO.getUserName());
            String jwtToken = jwtService.generateToken(userInfoDTO.getUserName());

            return new ResponseEntity<>(JwtResponseDTO.builder().accessToken(jwtToken).token(refreshToken.getToken()).build(), HttpStatus.OK);

        } catch (Exception e){
            return new ResponseEntity<>("Exception in User Service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
