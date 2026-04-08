package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.ResourcePreset;
import com.smartcampus.smart_campus_api.model.ResourceType;

import java.util.List;
import java.util.Map;

public final class ResourceCatalog {
    private ResourceCatalog() {}

    // Predefined resources per type (enum-like).
    private static final Map<ResourceType, List<ResourcePreset>> CATALOG = Map.of(
            ResourceType.HALL, List.of(
                    new ResourcePreset("LH_01", "Lecture Hall LH-01"),
                    new ResourcePreset("LH_02", "Lecture Hall LH-02"),
                    new ResourcePreset("AUDITORIUM", "Main Auditorium")
            ),
            ResourceType.LAB, List.of(
                    new ResourcePreset("CS_LAB_01", "Computer Lab 01"),
                    new ResourcePreset("NET_LAB", "Networking Lab"),
                    new ResourcePreset("ELEC_LAB", "Electronics Lab")
            ),
            ResourceType.MEETING_ROOM, List.of(
                    new ResourcePreset("MR_A", "Meeting Room A"),
                    new ResourcePreset("MR_B", "Meeting Room B"),
                    new ResourcePreset("BOARD", "Board Room")
            ),
            ResourceType.EQUIPMENT, List.of(
                    new ResourcePreset("PROJECTOR", "Projector"),
                    new ResourcePreset("PA_SYSTEM", "PA System"),
                    new ResourcePreset("CAMERA", "Camera")
            )
    );

    public static Map<ResourceType, List<ResourcePreset>> getCatalog() {
        return CATALOG;
    }

    public static boolean isAllowed(ResourceType type, String name) {
        if (type == null || name == null) return false;
        return CATALOG.getOrDefault(type, List.of())
                .stream()
                .anyMatch(p -> p.label().equalsIgnoreCase(name.trim()));
    }
}

