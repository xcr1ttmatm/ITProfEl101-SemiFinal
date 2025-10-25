import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0b0c10] via-[#111827] to-black text-cyan-100">
      {/* Futuristic Grid Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,200,0.05)_1px,transparent_1px),linear-gradient(rgba(0,255,200,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-4 bg-black/40 shadow-md backdrop-blur-sm border-b border-cyan-500/30">
        <h1 className="text-2xl font-bold text-[#22d3ee] tracking-wider drop-shadow-[0_0_10px_#22d3ee]">
          Student Portal
        </h1>
        <ul className="flex space-x-6 text-cyan-200 font-medium">
          <li>
            <Link
              to="/students"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              to="/subjects"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Subjects
            </Link>
          </li>
          <li>
            <Link
              to="/grades"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Grades
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-10">
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl bg-black/50 shadow-[0_0_20px_#22d3ee40] p-8 border border-[#22d3ee]/40 rounded-2xl backdrop-blur-md">
          {/* Left side - Image */}
          <div className="flex justify-center items-center">
            <img
              src="./public/profile.jpg"
              alt="Profile"
              className="w-48 md:w-64 lg:w-72 h-auto object-cover shadow-lg rounded-lg border border-[#4ade80]/40 hover:border-[#22d3ee]/70 transition-all duration-300"
            />
          </div>

          {/* Right side - Text */}
          <div className="flex flex-col justify-center text-cyan-100">
            <h2 className="text-4xl font-extrabold mb-4 text-[#22d3ee] drop-shadow-[0_0_12px_#4ade80]">
              Michael Angelo Mortola
            </h2>
            <p className="leading-relaxed text-lg text-cyan-200">
              My IT journey started in my first year of college, where I was
              introduced to the basics of programming and problem-solving. At
              first, writing simple "Hello World" programs felt challenging, but
              it laid the foundation for my growth.
              <br /> <br />
              As the semesters passed, I gained confidence exploring different
              languages, frameworks, and tools. From debugging endless errors to
              building my first working applications, every challenge taught me
              persistence and patience.
              <br /> <br />
              Today, I continue to explore new technologies and push myself
              further. My passion for IT has grown into more than just a skill —
              it’s become a journey of constant learning and discovery.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
