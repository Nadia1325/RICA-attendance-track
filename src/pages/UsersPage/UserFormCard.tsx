// src/pages/UsersPage/UserFormCard.tsx
import { FormEvent } from "react";
import { Button, Card, Input, Select } from "../../components/ui";
import type { Department } from "../../types/types";

interface UserFormCardProps {
  departments: Department[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function UserFormCard({ departments, onSubmit }: UserFormCardProps) {
  return (
    <Card className="mb-6 p-5">
      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        onSubmit={onSubmit}
      >
        <Input name="name" placeholder="Full name" required />
        <Input
          name="email"
          type="email"
          placeholder="Gmail / work email"
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Initial password"
          minLength={8}
          required
        />
        <Select name="role">
          <option value="admin">Admin</option>
          <option value="hod">Head of Department</option>
          <option value="director">Director</option>
        </Select>
        <Select name="departmentId">
          <option value="">Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Button type="submit" className="sm:col-span-2 lg:col-span-1">
          Create account
        </Button>
      </form>
    </Card>
  );
}