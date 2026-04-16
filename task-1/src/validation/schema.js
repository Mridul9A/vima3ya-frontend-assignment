import * as Yup from "yup";

export const formSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Invalid phone")
    .required("Phone is required"),
  address: Yup.string().required("Address required"),
  city: Yup.string().required("City required"),
  state: Yup.string().required("State required"),
  company: Yup.string().required("Company required"),
  role: Yup.string().required("Role required")
});