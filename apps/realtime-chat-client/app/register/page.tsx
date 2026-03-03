"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    await register(
      form.get("email") as string,
      form.get("password") as string
    );

    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-panel p-8 rounded-xl w-80 space-y-4"
      >
        <h2 className="text-xl font-semibold">Register</h2>

        <input
          name="name"
          placeholder="Name"
          className="w-full p-2 rounded bg-gray-800"
        />

        <input
          name="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-800"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-800"
        />

        <button
          disabled={loading}
          className="w-full bg-primary p-2 rounded"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}