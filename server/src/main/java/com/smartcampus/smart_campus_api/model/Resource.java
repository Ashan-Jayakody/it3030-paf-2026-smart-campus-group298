package com.smartcampus.smart_campus_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Document(collection = "resource")

public class Resource {

    @Id
    private String id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    private ResourceStatus status = ResourceStatus.AVAILABLE;

}
