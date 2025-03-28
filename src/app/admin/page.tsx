import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function handleLogin(formData: FormData) {
  "use server";
  const password = formData.get("password") as string;
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin-auth", password);
    redirect("/admin/create");
  }
}

export default function Page() {
  return (
    <form action={handleLogin}>
      <input type="password" name="password"></input>
      <button type="submit">로그인</button>
    </form>
  );
}
