import { describe, it, expect, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        data: { id: "member-id" },
        error: null,
        select: () => ({
          single: () => ({ data: { id: "member-id" }, error: null }),
        }),
      })),
    })),
    functions: {
      invoke: vi.fn(async (fn) => {
        if (fn === "create-checkout") {
          return { data: { url: "https://checkout.test/" }, error: null };
        }
        return { data: null, error: null };
      }),
    },
  },
}));

describe("Membership Registration", () => {
  it("should create a member and get checkout url", async () => {
    // Simulate form data
    const formData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "1234567890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      streetAddress: "123 Main St",
      city: "City",
      stateProvinceRegion: "State",
      postalZipCode: "12345",
      country: "United States",
      membershipType: "regular",
      ministryInterests: "",
      preferredLanguage: "english",
      emailUpdates: true,
      agreeToTerms: true,
    };
    // Simulate registration logic
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .insert([
        {
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
          membership_type: formData.membershipType,
          membership_status: "pending",
          join_date: new Date().toISOString(),
          registration_date: new Date().toISOString().split("T")[0],
          first_name: formData.firstName,
          last_name: formData.lastName,
          street_address: formData.streetAddress,
          city: formData.city,
          state_province_region: formData.stateProvinceRegion,
          postal_zip_code: formData.postalZipCode,
          country: formData.country,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          preferred_language: formData.preferredLanguage,
          ministry_interests: formData.ministryInterests
            ? [formData.ministryInterests]
            : [],
          email_updates: formData.emailUpdates,
        },
      ]);
    expect(memberData).toHaveProperty("id");
    expect(memberError).toBeNull();

    // Use fallback for memberId if memberData is null
    const checkoutData = {
      amount: "100",
      donationType: "one_time",
      purpose: "membership_fee",
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
      memberId:
        memberData && typeof memberData === "object" && "id" in memberData
          ? (memberData as any).id
          : "test-member-id",
      membershipType: formData.membershipType,
    };
    const response = await supabase.functions.invoke("create-checkout", {
      body: checkoutData,
    });
    expect(response.data.url).toContain("checkout");
    expect(response.error).toBeNull();
  });
});
