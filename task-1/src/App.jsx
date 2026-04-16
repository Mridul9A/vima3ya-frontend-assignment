import { Formik, Form } from "formik";
import { useRef, useState, useEffect } from "react";
import { formSchema } from "./validation/schema";
import FormField from "./components/FormField";
import Sidebar from "./components/Sidebar";
import Section from "./components/Section";
import Loader from "./components/Loader";
import useScrollTracker from "./hooks/useScrollTracker";
import "./index.css";

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSections, setActiveSections] = useState([]);

  const sectionRefs = useRef([]);

  useScrollTracker(sectionRefs, setActiveSections);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    company: "",
    role: ""
  };

  const onFormComplete = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={formSchema}
      onSubmit={async (values, { validateForm }) => {
        setSubmitted(true);

        const errors = await validateForm();

        if (Object.keys(errors).length === 0) {
          onFormComplete();
        }
      }}
    >
      {({ values }) => {
        // ✅ Auto trigger after submit when form becomes valid
        useEffect(() => {
          if (!submitted) return;

          const allFilled = Object.values(values).every(
            (v) => v && v.trim() !== ""
          );

          if (allFilled) {
            onFormComplete();
          }
        }, [values, submitted]);

        return (
          <Form className="container">
            <Sidebar
              activeSections={activeSections}
              onClick={scrollToSection}
            />

            <div className="content">
              {loading && <Loader />}

              {["A", "B", "C", "D"].map((sec, i) => (
                <Section
                  key={sec}
                  innerRef={(el) => {
                    sectionRefs.current[i] = el;
                    if (el) el.dataset.index = i;
                  }}
                  title={`Section ${sec} — ${
                    ["Personal Info", "Contact", "Location", "Work"][i]
                  }`}
                >
                  {i === 0 && (
                    <>
                      <FormField
                        name="name"
                        placeholder="Name"
                        submitted={submitted}
                      />
                      <FormField
                        name="email"
                        placeholder="Email"
                        submitted={submitted}
                      />
                    </>
                  )}

                  {i === 1 && (
                    <>
                      <FormField
                        name="phone"
                        placeholder="Phone"
                        submitted={submitted}
                      />
                      <FormField
                        name="address"
                        placeholder="Address"
                        submitted={submitted}
                      />
                    </>
                  )}

                  {i === 2 && (
                    <>
                      <FormField
                        name="city"
                        placeholder="City"
                        submitted={submitted}
                      />
                      <FormField
                        name="state"
                        placeholder="State"
                        submitted={submitted}
                      />
                    </>
                  )}

                  {i === 3 && (
                    <>
                      <FormField
                        name="company"
                        placeholder="Company"
                        submitted={submitted}
                      />
                      <FormField
                        name="role"
                        placeholder="Role"
                        submitted={submitted}
                      />
                    </>
                  )}
                </Section>
              ))}

              <button type="submit" className="submit">
                Submit
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}