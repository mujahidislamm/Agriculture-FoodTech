package com.example.repository;

import com.example.entity.PredictionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionLogRepository extends JpaRepository<PredictionLog, Long> {
	List<PredictionLog> findTop50ByOrderByCreatedAtDesc();
}