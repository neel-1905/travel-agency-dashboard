import { Header } from "components";
import React from "react";

const Trips = () => {
  return (
    <main className="all-users wrapper">
      <Header
        title={`Trips`}
        description="View and edit AI generated trip plans!"
        ctaText="Create A Trip"
        cta="/trips/create"
      />
    </main>
  );
};

export default Trips;
