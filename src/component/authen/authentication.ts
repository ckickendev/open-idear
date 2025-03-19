import { z } from "zod";

const password = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/
);

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").regex(password, {
    message: 'Your password must contain uppercase letter, number and character',
  }),
});

export const signUpSchema = z.object({
  email: z.string().min(6, "Username must be at least 6 characters"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").regex(password, {
    message: 'Your password must contain uppercase letter, number and character',
  }),
  repassword: z.string().min(6, "Password must be at least 6 characters"),
}).superRefine(({ repassword, password }, ctx) => {
  if (repassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ['repassword']
    });
  }
});

export interface DataAuthen {
  setIsAuthenFromDisplay: any;
}