package org.yogadev.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.yogadev.entities.RefreshToken;

import java.util.Optional;

@Repository
public interface RefreshTokenRespository extends CrudRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);
}
