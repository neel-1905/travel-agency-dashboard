import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { Header } from "components";
import type { Route } from "./+types/CreateTrip";
import { comboBoxItems, groupTypes, selectItems } from "~/constants";
import { cn, formatKey } from "lib/utils";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
} from "@syncfusion/ej2-react-maps";
import { useState } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();
  return data.map((country: any) => ({
    name: country.flag + country.name.common,
    coordinates: country.latlng,
    value: country.name.common,
    openStreetMap: country.maps?.openStreetMap,
  }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const countries = loaderData as Country[];
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TripFormData>({
    country: countries[0]?.name,
    duration: 0,
    travelStyle: "",
    budget: "",
    groupType: "",
    interest: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#ea382e",
      coordinates:
        countries.find((country) => country.name === formData.country)
          ?.coordinates || [],
    },
  ];

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here

    setLoading(true);
    if (
      !formData.country ||
      !formData.duration ||
      !formData.travelStyle ||
      !formData.budget ||
      !formData.groupType ||
      !formData.interest
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 and 10 days.");
      setLoading(false);
      return;
    }

    const user = await account.get();

    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: formData.country,
          travelStyle: formData.travelStyle,
          budget: formData.budget,
          numberOfDays: formData.duration,
          interests: formData.interest,
          groupType: formData.groupType,
          userId: user.$id,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) {
        navigate(`/trips/${result.id}`);
      } else {
        throw new Error("Failed to generate trip.");
      }
    } catch (error) {
      console.log("Error generating trip:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Add a new trip"
        description="View and edit AI generated trip plans!"
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="country">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData} // Replace with your data source
              fields={{ text: "text", value: "value" }}
              placeholder="Select a country"
              className="combo-box"
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();
                const filteredData = countries
                  .filter((country) =>
                    country.name.toLowerCase().includes(query)
                  )
                  .map((country) => ({
                    text: country.name,
                    value: country.value,
                  }));

                e.updateData(filteredData, null);
              }}
            />
          </div>

          <div>
            <label htmlFor="duration">Duration</label>
            <input
              type="number"
              id="duration"
              name="duration"
              placeholder="Enter number of days (5,10,...)"
              className="form-input placeholder:text-gray-100"
              onChange={(e) => {
                handleChange("duration", Number(e.target.value));
              }}
            />
          </div>

          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{formatKey(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item,
                }))} // Replace with your data source
                fields={{ text: "text", value: "value" }}
                placeholder={`Select ${formatKey(key)}`}
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering
                filtering={(e) => {
                  const query = e.text.toLowerCase();
                  const filteredData = comboBoxItems[key]
                    .filter((item) => item.toLowerCase().includes(query))
                    .map((item) => ({
                      text: item,
                      value: item,
                    }));

                  e.updateData(filteredData, null);
                }}
                className="combo-box"
              />
            </div>
          ))}

          <div>
            <label htmlFor="location">Location on the world map!</label>
            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  dataSource={mapData}
                  shapeData={world_map}
                  shapeDataPath="country"
                  shapePropertyPath={"name"}
                  shapeSettings={{
                    colorValuePath: "color",
                    fill: "#e5e5e5",
                  }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>

          <div className="bg-gray-200 h-px w-full" />

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              disabled={loading}
              className="button-class !h-12 !w-full"
            >
              <img
                src={`/assets/icons/${
                  loading ? "loader.svg" : "magic-star.svg"
                }`}
                alt=""
                className={cn(`size-5`, {
                  "animate-spin": loading,
                })}
              />
              <span className="p-16-semibold text-white">
                {loading ? "Generating..." : "Generate Trip"}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};

export default CreateTrip;
