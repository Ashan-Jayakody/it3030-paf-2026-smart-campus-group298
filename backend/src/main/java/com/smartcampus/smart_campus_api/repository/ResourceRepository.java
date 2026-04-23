package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
}