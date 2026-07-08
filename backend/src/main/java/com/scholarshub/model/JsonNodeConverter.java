package com.scholarshub.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Stores a Jackson JsonNode as text in the database. */
@Converter
public class JsonNodeConverter implements AttributeConverter<JsonNode, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(JsonNode attribute) {
        try {
            return attribute == null ? null : MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new IllegalStateException("Could not serialize settings JSON", e);
        }
    }

    @Override
    public JsonNode convertToEntityAttribute(String dbData) {
        try {
            return dbData == null ? null : MAPPER.readTree(dbData);
        } catch (Exception e) {
            throw new IllegalStateException("Could not deserialize settings JSON", e);
        }
    }
}
