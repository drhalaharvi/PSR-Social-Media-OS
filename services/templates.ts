
// This file mocks a simple template system.
// In a real application, this could be fetched from a database and be account-specific.

interface BrandTemplate {
  clinicName: string;
  primaryColor: string;
  secondaryColor: string;
  services: string[];
  contact: {
    phone: string;
    website: string;
  };
}

export const brandTemplate: BrandTemplate = {
  clinicName: "HealWell Clinic",
  primaryColor: "#3B82F6", // brand-secondary
  secondaryColor: "#1E40AF", // brand-primary
  services: [
    "General Check-ups",
    "Pediatrics",
    "Dermatology",
    "Cardiology",
    "Annual Flu Shots"
  ],
  contact: {
    phone: "555-123-4567",
    website: "www.healwellclinic.com"
  }
};
