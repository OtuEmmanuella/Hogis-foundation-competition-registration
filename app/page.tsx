import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Rules from '@/components/Rules';
import RegistrationForm from '@/components/RegistrationForm';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Rules />
      <RegistrationForm />
    </main>
  );
}