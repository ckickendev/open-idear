import { ForgotPassword } from './ForgotPassword';
import { boolean, z } from "zod";

const password = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/
);

export const REACT_APP_ROOT_BACKEND = "http://localhost:5001";

export const loginSchema = z.object({
  account: z.string().min(6, "Email or username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").regex(password, {
    message: 'Your password must contain uppercase letter, number and character',
  }),
});


export const resetPassSchema = z.object({
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
});;



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

export const forgotPasswordSchema = z.object({
  account: z.string().min(6, "Email or username must be at least 6 characters"),
})

