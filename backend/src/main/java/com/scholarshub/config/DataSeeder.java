package com.scholarshub.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.scholarshub.model.Chapter;
import com.scholarshub.model.Pdf;
import com.scholarshub.model.SiteSettings;
import com.scholarshub.model.Subject;
import com.scholarshub.model.User;
import com.scholarshub.repo.PdfRepository;
import com.scholarshub.repo.SiteSettingsRepository;
import com.scholarshub.repo.SubjectRepository;
import com.scholarshub.repo.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Seeds the in-memory database on startup so the API mirrors the demo content. */
@Component
public class DataSeeder implements CommandLineRunner {
    private final SubjectRepository subjects;
    private final PdfRepository pdfs;
    private final UserRepository users;
    private final SiteSettingsRepository settings;
    private final ObjectMapper mapper = new ObjectMapper();

    public DataSeeder(SubjectRepository subjects, PdfRepository pdfs,
                      UserRepository users, SiteSettingsRepository settings) {
        this.subjects = subjects;
        this.pdfs = pdfs;
        this.users = users;
        this.settings = settings;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return; // already seeded
        seedUsers();
        seedSubjects();
        seedPdfs();
        seedSettings();
    }

    private String now() {
        return Instant.now().toString();
    }

    private void seedUsers() {
        User admin = new User();
        admin.setId("u_admin");
        admin.setName("Anand Verma");
        admin.setEmail("admin@academy.in");
        admin.setPassword("admin123");
        admin.setRole("ADMIN");
        admin.setCreatedAt(now());
        admin.setLastLogin(now());

        User demo = new User();
        demo.setId("u_demo");
        demo.setName("Demo Student");
        demo.setEmail("student@demo.in");
        demo.setPassword("demo123");
        demo.setRole("STUDENT");
        demo.setCreatedAt(now());
        demo.setLastLogin(now());

        users.saveAll(List.of(admin, demo));
    }

    private Subject subject(String id, String name, String className, String description, Chapter... chapters) {
        Subject s = new Subject();
        s.setId(id);
        s.setName(name);
        s.setClassName(className);
        s.setDescription(description);
        s.setChapters(List.of(chapters));
        return s;
    }

    private void seedSubjects() {
        subjects.saveAll(List.of(
            subject("s_m9", "Mathematics", "Class 9",
                "Foundations: number systems, algebra, geometry and coordinate geometry.",
                new Chapter("c1", "Number Systems"), new Chapter("c2", "Polynomials"),
                new Chapter("c3", "Coordinate Geometry"), new Chapter("c4", "Linear Equations in Two Variables")),
            subject("s_bs11", "Business Studies", "Class 11",
                "Nature of business, forms of organisation, services and enterprise.",
                new Chapter("c1", "Nature & Purpose of Business"), new Chapter("c2", "Forms of Business Organisation"),
                new Chapter("c3", "Private, Public & Global Enterprises")),
            subject("s_bs12", "Business Studies", "Class 12",
                "Management principles, functions, finance and marketing.",
                new Chapter("c1", "Nature & Significance of Management"), new Chapter("c2", "Principles of Management"),
                new Chapter("c3", "Financial Management"), new Chapter("c4", "Marketing Management")),
            subject("s_ec11", "Economics", "Class 11",
                "Statistics for economics and introductory microeconomics.",
                new Chapter("c1", "Introduction to Statistics"), new Chapter("c2", "Collection & Organisation of Data"),
                new Chapter("c3", "Measures of Central Tendency")),
            subject("s_ec12", "Economics", "Class 12",
                "Macroeconomics: national income, money, banking and budget.",
                new Chapter("c1", "National Income & Accounting"), new Chapter("c2", "Money & Banking"),
                new Chapter("c3", "Government Budget & the Economy"))
        ));
    }

    private Pdf pdf(String title, String subjectId, String chapterId, boolean isFree, int price, int downloads) {
        Pdf p = new Pdf();
        p.setId("pdf_" + Long.toHexString(System.nanoTime()));
        p.setTitle(title);
        p.setSubjectId(subjectId);
        p.setChapterId(chapterId);
        p.setIsFree(isFree);
        p.setPrice(price);
        p.setCreatedAt(now());
        p.setDownloads(downloads);
        return p;
    }

    private void seedPdfs() {
        pdfs.saveAll(List.of(
            pdf("Number Systems — Full Notes", "s_m9", "c1", true, 0, 142),
            pdf("Polynomials — Solved Examples", "s_m9", "c2", false, 49, 88),
            pdf("Forms of Business Organisation — Summary", "s_bs11", "c2", true, 0, 203),
            pdf("Principles of Management — Exam Notes", "s_bs12", "c2", false, 79, 167),
            pdf("Financial Management — Quick Revision", "s_bs12", "c3", false, 59, 121),
            pdf("Measures of Central Tendency — Worked Problems", "s_ec11", "c3", false, 69, 94),
            pdf("National Income — Complete Notes", "s_ec12", "c1", false, 89, 211),
            pdf("Money & Banking — One-shot", "s_ec12", "c2", true, 0, 176)
        ));
    }

    private ObjectNode testimonial(String name, String role, String text) {
        ObjectNode t = mapper.createObjectNode();
        t.put("id", "t_" + Long.toHexString(System.nanoTime()));
        t.put("name", name);
        t.put("role", role);
        t.put("text", text);
        return t;
    }

    private void seedSettings() {
        ObjectNode root = mapper.createObjectNode();
        root.put("tuitionName", "Lakshya Commerce & Maths Academy");
        root.put("tagline", "Conceptual learning for Commerce & Mathematics — built for board exam confidence.");

        ObjectNode hero = root.putObject("hero");
        hero.put("title", "Notes that actually make the concept click.");
        hero.put("subtitle", "Chapter-wise notes, solved examples and exam-ready summaries for Class 9 Maths and Class 11–12 Commerce. Free previews, paid depth.");
        hero.put("image", "");

        ObjectNode teacher = root.putObject("teacher");
        teacher.put("name", "Anand Verma");
        teacher.put("title", "Founder & Mentor");
        teacher.put("qualifications", "M.Com, B.Ed · 12+ years teaching Commerce & Maths");
        teacher.put("bio", "I teach Economics, Business Studies and Mathematics the way I wish someone had taught me — starting from why a concept exists, then drilling into exam technique. Every note here is written and reviewed by me.");
        teacher.put("photo", "");

        root.put("about", "Lakshya is a small-batch tuition focused on Commerce and Maths. We keep groups small, notes sharp, and doubts welcome.");

        ObjectNode contact = root.putObject("contact");
        contact.put("phone", "+91 98xxx xxxxx");
        contact.put("email", "hello@lakshyaacademy.in");
        contact.put("whatsapp", "+91 98xxx xxxxx");
        contact.put("address", "2nd Floor, Vidya Bhawan, Karol Bagh, New Delhi");

        ObjectNode payment = root.putObject("payment");
        payment.put("upiId", "lakshyaacademy@okhdfcbank");
        payment.put("upiName", "Lakshya Commerce & Maths Academy");
        payment.put("bankName", "HDFC Bank");
        payment.put("accountName", "Lakshya Academy");
        payment.put("accountNumber", "50100XXXXXXXXX");
        payment.put("ifsc", "HDFC0001234");
        payment.put("qr", "");
        payment.put("instructions", "Pay the exact amount to the UPI ID or bank account above, then enter your UPI reference / UTR number below. We verify and unlock your note, usually within a few hours.");

        ArrayNode testimonials = root.putArray("testimonials");
        testimonials.add(testimonial("Riya S.", "Class 12 · Commerce", "The Economics summaries saved me before boards. Went from 60s to 88."));
        testimonials.add(testimonial("Aman K.", "Class 11 · Business Studies", "Sir explains every line. The paid notes are genuinely worth it."));
        testimonials.add(testimonial("Parent of Class 9 student", "Maths", "My son finally stopped fearing maths. Clear, patient teaching."));

        settings.save(new SiteSettings(root));
    }
}
