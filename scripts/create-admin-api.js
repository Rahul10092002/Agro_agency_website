const { default: fetch } = require("node-fetch");

async function createAdmin() {
  try {
    console.log("Creating admin user...");

    const response = await fetch(
      "http://localhost:3001/api/admin/create-admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log("✅ Success!", data.message);
      console.log("\n=== Admin Credentials ===");
      console.log("Email:", data.admin.email);
      console.log("Password:", data.admin.password);
      console.log("Name:", data.admin.name);
      console.log("========================\n");
      console.log(
        "🎉 You can now login to the admin panel at: http://localhost:3001/admin/login"
      );
    } else {
      console.log("❌ Failed:", data.message);
      if (data.error) {
        console.log("Error details:", data.error);
      }
    }
  } catch (error) {
    console.error("❌ Error calling API:", error.message);
    console.log(
      "\n💡 Make sure the Next.js server is running on http://localhost:3001"
    );
  }
}

createAdmin();
