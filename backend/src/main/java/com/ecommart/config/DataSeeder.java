package com.ecommart.config;

import com.ecommart.model.Product;
import com.ecommart.model.User;
import com.ecommart.repository.ProductRepository;
import com.ecommart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Users
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("EcomMart Admin")
                    .email("admin@ecommart.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .address("Admin HQ, Connaught Place, New Delhi")
                    .phone("+919876543210")
                    .build();

            User customer = User.builder()
                    .name("Rajesh Kumar")
                    .email("customer@ecommart.com")
                    .password(passwordEncoder.encode("password123"))
                    .role("ROLE_CUSTOMER")
                    .address("Flat 302, Green Glen Layout, Bellandur, Bengaluru, Karnataka")
                    .phone("+918765432109")
                    .build();

            userRepository.saveAll(Arrays.asList(admin, customer));
            System.out.println("Mock Users Seeded: admin@ecommart.com / customer@ecommart.com");
        }

        // Seed Products
        if (productRepository.count() == 0) {
            Product p1 = Product.builder()
                    .name("Solid Sheesham Wood Dining Table")
                    .description("Premium 4-seater dining table handcrafted from solid Sheesham wood with a warm chestnut finish. Durable, elegant, and perfect for modern Indian homes.")
                    .price(24999.0)
                    .imageUrl("https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600&auto=format&fit=crop")
                    .category("Furniture")
                    .stock(15)
                    .build();

            Product p2 = Product.builder()
                    .name("Ergonomic Office Chair with Lumbar Support")
                    .description("High-back mesh chair with adjustable headrest, 3D armrests, dynamic lumbar support, and heavy-duty nylon base. Designed for work-from-home comfort.")
                    .price(8499.0)
                    .imageUrl("https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=600&auto=format&fit=crop")
                    .category("Furniture")
                    .stock(30)
                    .build();

            Product p3 = Product.builder()
                    .name("Fabric 3-Seater Sofa in Teal Blue")
                    .description("Plush 3-seater sofa upholstered in premium breathable fabric. Solid wood frame and high-density foam cushioning ensure comfort and longevity.")
                    .price(18999.0)
                    .imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop")
                    .category("Furniture")
                    .stock(8)
                    .build();

            Product p4 = Product.builder()
                    .name("Noise ColorFit Ultra Smartwatch")
                    .description("Smartwatch with 1.75 inch AMOLED display, built-in GPS, 60+ sports modes, 24/7 heart rate monitor, SpO2 sensor, and 7-day battery life. Metallic black.")
                    .price(2999.0)
                    .imageUrl("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop")
                    .category("Electronics")
                    .stock(50)
                    .build();

            Product p5 = Product.builder()
                    .name("boAt Airdopes 141 TWS Earbuds")
                    .description("True Wireless earbuds with up to 42 hours playback, ENx Tech for clear calls, ASAP Charge, low latency beast mode, and IPX4 water resistance. Bold Black.")
                    .price(1299.0)
                    .imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop")
                    .category("Electronics")
                    .stock(100)
                    .build();

            Product p6 = Product.builder()
                    .name("Redmi 12 5G (8GB RAM, 256GB Storage)")
                    .description("Snapdragon 4 Gen 2 octa-core processor, 6.79-inch FHD+ 90Hz display, 50MP AI dual camera, and massive 5000mAh battery. Infinite Black.")
                    .price(13999.0)
                    .imageUrl("https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop")
                    .category("Electronics")
                    .stock(25)
                    .build();

            Product p7 = Product.builder()
                    .name("Prestige Induction Cooktop (2000W)")
                    .description("High-performance induction cooktop with Indian menu options, automatic voltage regulator, soft-touch buttons, and anti-magnetic wall safety. Energy efficient.")
                    .price(2499.0)
                    .imageUrl("https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop")
                    .category("Appliances")
                    .stock(40)
                    .build();

            Product p8 = Product.builder()
                    .name("Kent Ultra Storage UV Water Purifier")
                    .description("Wall-mountable UV water purifier with storage tank. Double purification process of UV + UF. Suitable for low TDS tap water.")
                    .price(8999.0)
                    .imageUrl("https://images.unsplash.com/photo-1585837575652-267c0ee123e7?q=80&w=600&auto=format&fit=crop")
                    .category("Appliances")
                    .stock(12)
                    .build();

            Product p9 = Product.builder()
                    .name("Handcrafted Ceramic Flower Vase")
                    .description("Stunning handcrafted ceramic vase with a rustic textured finish. A perfect decorative centerpiece for living rooms or entryways.")
                    .price(999.0)
                    .imageUrl("https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=600&auto=format&fit=crop")
                    .category("Decor")
                    .stock(20)
                    .build();

            Product p10 = Product.builder()
                    .name("Premium Cotton King Size Bedsheet")
                    .description("Luxurious 300 thread count cotton sheet set including one king bedsheet and two matching pillow covers. Soft, breathable, and fade resistant.")
                    .price(1499.0)
                    .imageUrl("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop")
                    .category("Decor")
                    .stock(35)
                    .build();

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10));
            System.out.println("Mock Products Seeded successfully.");
        }
    }
}
