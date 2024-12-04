package org.yogadev.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // 256 bits String
    private static final String TOKEN = "7VS1YiAzrKN6yNLvki9Lc+AjlaZb4yfQoIr7npU4StI=";

    // <T> Any generic, can represent with the word T
    public <T> T extractClaim(String token, Function<Claims, T> claimResolver){ // R apply(T t);
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        // parser() => Returns JwtParserBuilder
        // build()  => Returns JwtParser

        // compact cryptographically-signed Claims JWS.
        // parsed cryptographically-verified Claims JWS.
        return Jwts.parser().verifyWith(getSignKey()).build().parseSignedClaims(token).getPayload();
    }

    // interface
    private SecretKey getSignKey(){
        byte[] keyBytes = Decoders.BASE64.decode(TOKEN);
        return Keys.hmacShaKeyFor(keyBytes); // Key, algorithm
    }

    public String extractUserName(String token){
        return extractClaim(token, Claims::getSubject); // String getSubject();
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration); // Date getExpiration();
    }

    private Boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, UserDetails userDetails){
        final String username = extractUserName(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String generateToken(Map<String, Object> claims, String username){
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60))
                .signWith(getSignKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateToken(String username){
        return generateToken(new HashMap<>(), username);
    }
}
