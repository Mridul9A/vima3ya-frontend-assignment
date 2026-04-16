import { useField } from "formik";

export default function FormField({ name, placeholder, submitted }) {
  const [field, meta] = useField(name);

  return (
    <div className="field">
      <input {...field} placeholder={placeholder} />

      {submitted && meta.error && (
        <p className="error">{meta.error}</p>
      )}
    </div>
  );
}