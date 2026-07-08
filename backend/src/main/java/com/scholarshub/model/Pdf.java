package com.scholarshub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A PDF note (free or paid) attached to a subject + chapter. */
@Entity
@Table(name = "pdfs")
public class Pdf {
    @Id
    private String id;

    private String title;
    private String subjectId;
    private String chapterId;
    private boolean isFree = true;
    private int price = 0;

    // Base64 data-URI thumbnail. Large VARCHAR is portable across H2 and Postgres.
    @Column(length = 10_485_760)
    private String thumbnail;

    private String createdAt;
    private int downloads = 0;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getChapterId() { return chapterId; }
    public void setChapterId(String chapterId) { this.chapterId = chapterId; }

    public boolean getIsFree() { return isFree; }
    public void setIsFree(boolean isFree) { this.isFree = isFree; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public int getDownloads() { return downloads; }
    public void setDownloads(int downloads) { this.downloads = downloads; }
}
