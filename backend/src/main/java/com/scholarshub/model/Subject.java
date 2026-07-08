package com.scholarshub.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    private String id;

    private String name;
    private String className;

    @Column(length = 1000)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subject_chapters", joinColumns = @JoinColumn(name = "subject_id"))
    @OrderColumn(name = "position")
    private List<Chapter> chapters = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Chapter> getChapters() { return chapters; }
    public void setChapters(List<Chapter> chapters) {
        this.chapters = chapters == null ? new ArrayList<>() : chapters;
    }
}
