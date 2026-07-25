export default function FooterAdmin() {
  return (
    <footer className="bg-white border-t-4 border-black p-4 text-center">
      <p className="font-mono text-sm font-bold text-black">
        © {new Date().getFullYear()}{" "}
        <span className="bg-black text-white px-1 border border-black">
          Abdian
        </span>
        . All rights reserved.
      </p>
    </footer>
  );
}
