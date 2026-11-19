import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Why } from "@/components/sections/Why";
import { Method } from "@/components/sections/Method";
import { Companion } from "@/components/sections/Companion";
import { Path } from "@/components/sections/Path";
import { Scenarios } from "@/components/sections/Scenarios";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Why />
        <Method />
        <Companion />
        <Path />
        <Scenarios />
      </main>
    </>
  );
}
