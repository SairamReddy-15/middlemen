package com.farmdirect.config;

import com.farmdirect.model.Order;
import com.farmdirect.model.OrderItem;
import com.farmdirect.model.OrderStatus;
import com.farmdirect.model.PaymentMethod;
import com.farmdirect.model.PaymentStatus;
import com.farmdirect.model.Product;
import com.farmdirect.model.ProductCategory;
import com.farmdirect.model.Role;
import com.farmdirect.model.User;
import com.farmdirect.repository.OrderRepository;
import com.farmdirect.repository.ProductRepository;
import com.farmdirect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(UserRepository userRepository,
                      ProductRepository productRepository,
                      OrderRepository orderRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${farmdirect.seed.admin-email}") String adminEmail,
                      @Value("${farmdirect.seed.admin-password}") String adminPassword) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDemoData();
    }

    private void seedAdmin() {
        String email = adminEmail.trim().toLowerCase();
        if (!userRepository.existsByEmail(email)) {
            User admin = new User("FarmDirect Admin", email, passwordEncoder.encode(adminPassword), Role.ADMIN);
            admin.setLocation("Platform");
            userRepository.save(admin);
            System.out.println("Seeded admin account: " + email);
        }
    }

    private void seedDemoData() {
        if (userRepository.countByRole(Role.FARMER) > 0 || productRepository.count() > 0) {
            return;
        }

        User ramesh = farmer("Ramesh Kumar", "ramesh.kumar@farmdirect.dev",
                "Kumar Organic Farm", "Nashik, Maharashtra", "9876500001",
                "12 acres of certified organic vegetable and fruit cultivation.");
        User sunita = farmer("Sunita Patel", "sunita.patel@farmdirect.dev",
                "Patel Greens", "Anand, Gujarat", "9876500002",
                "Family-run farm specialising in grains, pulses and fresh milk.");
        User mohammed = farmer("Mohammed Ali", "mohammed.ali@farmdirect.dev",
                "Ali Dairy & Farms", "Hyderabad, Telangana", "9876500003",
                "Dairy, poultry and spice producer serving local customers.");

        User priya = customer("Priya Sharma", "priya.sharma@farmdirect.dev",
                "Pune, Maharashtra", "Flat 302, Green Meadows, Baner, Pune 411045", "9876500010");
        User arjun = customer("Arjun Reddy", "arjun.reddy@farmdirect.dev",
                "Bengaluru, Karnataka", "12 MG Road, Indiranagar, Bengaluru 560038", "9876500011");

        Product tomatoes = product(ramesh, "Fresh Tomatoes", ProductCategory.VEGETABLES, 30.0, "kg", 200,
                "Farm-fresh red tomatoes harvested this week.", "Nashik, Maharashtra");
        Product onions = product(ramesh, "Red Onions", ProductCategory.VEGETABLES, 25.0, "kg", 320,
                "Firm, well-cured red onions.", "Nashik, Maharashtra");
        Product mangoes = product(ramesh, "Alphonso Mangoes", ProductCategory.FRUITS, 180.0, "kg", 85,
                "Sweet Alphonso mangoes from Konkan grafts.", "Nashik, Maharashtra");
        Product spinach = product(ramesh, "Baby Spinach", ProductCategory.VEGETABLES, 18.0, "bunch", 140,
                "Tender spinach bunches, pesticide-free.", "Nashik, Maharashtra");

        Product rice = product(sunita, "Basmati Rice", ProductCategory.GRAINS, 95.0, "kg", 500,
                "Aged long-grain basmati rice.", "Anand, Gujarat");
        Product atta = product(sunita, "Whole Wheat Atta", ProductCategory.GRAINS, 45.0, "kg", 260,
                "Stone-ground whole wheat flour.", "Anand, Gujarat");
        Product toorDal = product(sunita, "Toor Dal", ProductCategory.PULSES, 120.0, "kg", 180,
                "Hand-sorted split pigeon peas.", "Anand, Gujarat");
        Product milk = product(sunita, "Fresh Cow Milk", ProductCategory.DAIRY, 55.0, "litre", 120,
                "A2 cow milk delivered fresh each morning.", "Anand, Gujarat");

        Product paneer = product(mohammed, "Farm Paneer", ProductCategory.DAIRY, 320.0, "kg", 45,
                "Soft paneer made from fresh milk.", "Hyderabad, Telangana");
        Product eggs = product(mohammed, "Free-range Eggs", ProductCategory.OTHER, 90.0, "dozen", 130,
                "Eggs from free-range hens.", "Hyderabad, Telangana");
        Product chilli = product(mohammed, "Red Chilli Powder", ProductCategory.SPICES, 240.0, "kg", 60,
                "Sun-dried Guntur chilli powder.", "Hyderabad, Telangana");
        Product turmeric = product(mohammed, "Turmeric Powder", ProductCategory.SPICES, 180.0, "kg", 70,
                "High-curcumin turmeric powder.", "Hyderabad, Telangana");

        // A couple of demo orders so dashboards have data.
        Order o1 = new Order(arjun, ramesh, arjun.getAddress(), PaymentMethod.CASH_ON_DELIVERY);
        o1.setContactPhone(arjun.getPhone());
        o1.setNotes("Please deliver before 10am.");
        o1.setStatus(OrderStatus.PROCESSING);
        o1.setPaymentStatus(PaymentStatus.PENDING);
        o1.addItem(new OrderItem(tomatoes, 5));
        o1.addItem(new OrderItem(onions, 4));
        o1.setDeliveryStatus(com.farmdirect.model.DeliveryStatus.ASSIGNED);
        o1.setDeliveryAgent("Ravi (local courier)");
        orderRepository.save(o1);

        Order o2 = new Order(priya, sunita, priya.getAddress(), PaymentMethod.ONLINE);
        o2.setContactPhone(priya.getPhone());
        o2.setStatus(OrderStatus.DELIVERED);
        o2.setPaymentStatus(PaymentStatus.PAID);
        o2.setPaymentReference("TXN-DEMO-1001");
        o2.addItem(new OrderItem(rice, 10));
        o2.addItem(new OrderItem(milk, 4));
        o2.setDeliveryStatus(com.farmdirect.model.DeliveryStatus.DELIVERED);
        o2.setDeliveredAt(java.time.LocalDateTime.now().minusDays(2));
        orderRepository.save(o2);

        System.out.println("Seeded 3 farmers, 2 customers and " + productRepository.count() + " products.");
        System.out.println("Demo logins (password shown in brackets):");
        System.out.println("  admin@farmdirect.com (Admin@123)");
        System.out.println("  ramesh.kumar@farmdirect.dev | sunita.patel@farmdirect.dev | mohammed.ali@farmdirect.dev (Farmer@123)");
        System.out.println("  priya.sharma@farmdirect.dev | arjun.reddy@farmdirect.dev (Customer@123)");
    }

    private User farmer(String name, String email, String farmName, String location, String phone, String address) {
        User u = new User(name, email, passwordEncoder.encode("Farmer@123"), Role.FARMER);
        u.setFarmName(farmName);
        u.setLocation(location);
        u.setPhone(phone);
        u.setAddress(address);
        return userRepository.save(u);
    }

    private User customer(String name, String email, String location, String address, String phone) {
        User u = new User(name, email, passwordEncoder.encode("Customer@123"), Role.CUSTOMER);
        u.setLocation(location);
        u.setAddress(address);
        u.setPhone(phone);
        return userRepository.save(u);
    }

    private Product product(User farmer, String name, ProductCategory category, Double price, String unit,
                            Integer stock, String description, String location) {
        Product p = new Product(farmer, name, category, price, unit, stock);
        p.setDescription(description);
        p.setLocation(location);
        return productRepository.save(p);
    }
}
