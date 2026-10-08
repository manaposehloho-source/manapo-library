export default function FormError({ message }) {
  return message ? <p className="form-error">{message}</p> : null;
}
