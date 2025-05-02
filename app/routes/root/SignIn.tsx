import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, redirect } from "react-router";
import { loginWithGoogle } from "~/appwrite/auth";
import { account } from "~/appwrite/client";

export async function clientLoader() {
  try {
    const user = await account.get();

    console.log("user in sign in", user);

    if (user.$id) {
      return redirect("/");
    }

    return redirect("/sign-in");
  } catch (error) {
    console.log("Error fetching user", error);
  }
}

const SignIn = () => {
  const handleSignIn = async () => {
    await loginWithGoogle();
  };

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to={`/`}>
              <img
                src="/assets/icons/logo.svg"
                alt="Logo"
                className="size-[30px]"
              />
            </Link>
            <h1 className="p-28-bold tex-dark-100">TourVisto</h1>
          </header>

          <article>
            <h2 className="p-28-semibold text-center text-dark-100">
              Start your travel journey
            </h2>
            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign in with google to manage destinations, itineraries, and user
              activity with ease.
            </p>
          </article>

          <ButtonComponent
            type="button"
            iconCss="e-search-icon"
            className="button-class !h-11 !w-full"
            onClick={handleSignIn}
          >
            <img
              src="/assets/icons/google.svg"
              alt="Google"
              className="size-5"
            />
            <span className="p-18-semibold text-white">
              Sign in with Google
            </span>
          </ButtonComponent>
        </div>
      </section>
    </main>
  );
};

export default SignIn;
