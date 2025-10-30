// src/app/_components/footer.tsx
export default function Footer() {
  return (
    <footer className="border-t py-6 mt-12">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LokalKeren. All rights reserved.
      </div>
    </footer>
  );
}