package com.scholarshub.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A payment record for a note purchase (SUCCESS or FAILED). */
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    private String id;

    private String userId;
    private String userEmail;
    private String pdfId;
    private String pdfTitle;
    private int amount;
    private String status;   // PENDING | SUCCESS | FAILED
    private String method;   // Manual UPI / Bank transfer
    private String transactionId;   // UPI reference / UTR entered by the student
    private String payerName;
    private String createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getPdfId() { return pdfId; }
    public void setPdfId(String pdfId) { this.pdfId = pdfId; }

    public String getPdfTitle() { return pdfTitle; }
    public void setPdfTitle(String pdfTitle) { this.pdfTitle = pdfTitle; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
