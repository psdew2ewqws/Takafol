#!/usr/bin/env npx tsx
/**
 * Nahno.org Volunteer Bot
 * Automates login + applying to volunteer opportunities on nahno.org
 *
 * Usage:
 *   npx tsx scripts/nahno-volunteer-bot.ts login <email> <password>
 *   npx tsx scripts/nahno-volunteer-bot.ts apply <email> <password> <opportunityUrl>
 *   npx tsx scripts/nahno-volunteer-bot.ts register <firstName> <lastName> <email> <password>
 */

import { chromium, type Browser, type Page } from "playwright";

// ─── Types ────────────────────────────────────────────

interface LoginResult {
  success: boolean;
  message: string;
  userName?: string;
}

interface ApplyResult {
  success: boolean;
  message: string;
  opportunityTitle?: string;
  alreadyApplied?: boolean;
}

interface RegisterResult {
  success: boolean;
  message: string;
}

interface BotConfig {
  headless?: boolean;
  timeout?: number;
}

// ─── Nahno Bot Class ──────────────────────────────────

export class NahnoBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: BotConfig;

  constructor(config: BotConfig = {}) {
    this.config = {
      headless: config.headless ?? true,
      timeout: config.timeout ?? 30000,
    };
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(this.config.timeout!);
  }

  async close(): Promise<void> {
    if (this.browser) await this.browser.close();
    this.browser = null;
    this.page = null;
  }

  // ─── Login ────────────────────────────────────────

  async login(email: string, password: string): Promise<LoginResult> {
    if (!this.page) throw new Error("Bot not initialized");

    try {
      console.log("[bot] Navigating to login page...");
      await this.page.goto("https://www.nahno.org/login", {
        waitUntil: "domcontentloaded",
      });

      // Click "تسجيل الدخول بالبريد الالكتروني" (Login via email)
      const emailLoginBtn = this.page.locator(
        'button:has-text("البريد الإلكتروني"), button:has-text("البريد الالكتروني"), a:has-text("البريد")'
      );
      if ((await emailLoginBtn.count()) > 0) {
        await emailLoginBtn.first().click();
        await this.page.waitForTimeout(1000);
      }

      // Fill email and password
      const emailInput = this.page.locator(
        'input[name="email"], input[type="email"], input[placeholder*="بريد"], input[placeholder*="email"]'
      );
      const passwordInput = this.page.locator(
        'input[name="password"], input[type="password"]'
      );

      await emailInput.first().fill(email);
      await passwordInput.first().fill(password);

      // Click login button
      const loginBtn = this.page.locator(
        'button:has-text("تسجيل الدخول"), input[type="submit"]:has-text("تسجيل"), button[type="submit"]'
      );
      await loginBtn.first().click();

      // Wait for navigation or error
      await this.page.waitForTimeout(3000);

      const currentUrl = this.page.url();
      const bodyText = await this.page.evaluate(
        () => document.body?.innerText?.substring(0, 500) || ""
      );

      if (
        currentUrl.includes("/dashboard") ||
        currentUrl.includes("/profile") ||
        currentUrl.includes("/volunteer")
      ) {
        const userName = await this.page
          .evaluate(() => {
            const nameEl = document.querySelector(
              ".user-name, .profile-name, .dropdown-toggle"
            );
            return nameEl?.textContent?.trim() || "";
          })
          .catch(() => "");

        console.log(`[bot] Login successful! User: ${userName || "Unknown"}`);
        return { success: true, message: "Login successful", userName };
      }

      if (
        bodyText.includes("خطأ") ||
        bodyText.includes("error") ||
        bodyText.includes("غير صحيح")
      ) {
        return {
          success: false,
          message: "Login failed: Invalid credentials",
        };
      }

      // Check if we're still on login page
      if (currentUrl.includes("/login")) {
        return {
          success: false,
          message: "Login failed: Still on login page",
        };
      }

      return { success: true, message: "Login appears successful" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[bot] Login error:", msg);
      return { success: false, message: `Login error: ${msg}` };
    }
  }

  // ─── Apply to Volunteer Opportunity ───────────────

  async applyToOpportunity(opportunityUrl: string): Promise<ApplyResult> {
    if (!this.page) throw new Error("Bot not initialized");

    try {
      console.log(`[bot] Navigating to opportunity: ${opportunityUrl}`);
      await this.page.goto(opportunityUrl, {
        waitUntil: "domcontentloaded",
      });

      // Get opportunity title
      const title = await this.page
        .evaluate(() => {
          const titleEl = document.querySelector(
            "h1, .project-title, .volunteer-title"
          );
          return titleEl?.textContent?.trim() || "";
        })
        .catch(() => "");

      console.log(`[bot] Opportunity: ${title}`);

      // Check if already applied
      const pageText = await this.page.evaluate(
        () => document.body?.innerText || ""
      );

      if (
        pageText.includes("لقد تطوعت") ||
        pageText.includes("سبق التطوع") ||
        pageText.includes("already applied")
      ) {
        console.log("[bot] Already applied to this opportunity");
        return {
          success: true,
          message: "Already applied",
          opportunityTitle: title,
          alreadyApplied: true,
        };
      }

      // Check if opportunity is full
      if (pageText.includes("اكتمل العدد") || pageText.includes("full")) {
        return {
          success: false,
          message: "Opportunity is full",
          opportunityTitle: title,
        };
      }

      // Find and click the volunteer/apply button
      const applyBtn = this.page.locator(
        'a:has-text("تطوع"), button:has-text("تطوع"), a:has-text("سجل"), button:has-text("سجل"), .volunteer-btn, .apply-btn'
      );

      if ((await applyBtn.count()) === 0) {
        return {
          success: false,
          message: "No apply button found",
          opportunityTitle: title,
        };
      }

      await applyBtn.first().click();
      await this.page.waitForTimeout(3000);

      // Check for confirmation or success
      const afterText = await this.page.evaluate(
        () => document.body?.innerText?.substring(0, 1000) || ""
      );
      const afterUrl = this.page.url();

      // If redirected to login, we're not authenticated
      if (afterUrl.includes("/login")) {
        return {
          success: false,
          message: "Not logged in - redirected to login page",
          opportunityTitle: title,
        };
      }

      // Check for confirmation dialog or success message
      if (
        afterText.includes("تم التسجيل") ||
        afterText.includes("تم التطوع") ||
        afterText.includes("بنجاح") ||
        afterText.includes("successfully")
      ) {
        console.log("[bot] Successfully applied!");
        return {
          success: true,
          message: "Successfully applied to volunteer opportunity",
          opportunityTitle: title,
        };
      }

      // Handle confirmation dialogs (some opportunities ask for confirmation)
      const confirmBtn = this.page.locator(
        'button:has-text("تأكيد"), button:has-text("نعم"), button:has-text("موافق"), .swal2-confirm'
      );
      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.first().click();
        await this.page.waitForTimeout(2000);
        console.log("[bot] Confirmed application");
        return {
          success: true,
          message: "Applied and confirmed",
          opportunityTitle: title,
        };
      }

      return {
        success: true,
        message: "Application submitted (unconfirmed)",
        opportunityTitle: title,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[bot] Apply error:", msg);
      return { success: false, message: `Apply error: ${msg}` };
    }
  }

  // ─── Register New Account ─────────────────────────

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    options: {
      gender?: "male" | "female";
      nationality?: string;
      governorate?: string;
      area?: string;
      birthDate?: string;
    } = {}
  ): Promise<RegisterResult> {
    if (!this.page) throw new Error("Bot not initialized");

    const {
      gender = "male",
      nationality = "أردني",
      governorate = "عمان",
      area = "تلاع العلي",
      birthDate = "01/01/2000",
    } = options;

    try {
      console.log("[bot] Navigating to registration page...");
      await this.page.goto("https://www.nahno.org/register/user/index.php", {
        waitUntil: "domcontentloaded",
      });

      // Click "Register via email"
      const emailRegBtn = this.page.locator(
        'button:has-text("البريد الإلكتروني")'
      );
      if ((await emailRegBtn.count()) > 0) {
        await emailRegBtn.first().click();
        await this.page.waitForTimeout(1500);
      }

      // Step 1: Basic Info
      console.log("[bot] Step 1: Filling basic info...");
      await this.page
        .locator('input[placeholder*="الإسم الاول"], input[name*="first"]')
        .first()
        .fill(firstName);
      await this.page
        .locator('input[placeholder*="إسم العائلة"], input[name*="last"]')
        .first()
        .fill(lastName);
      await this.page
        .locator(
          'input[placeholder*="البريد الإلكتروني"]:not([placeholder*="تأكيد"])'
        )
        .first()
        .fill(email);
      await this.page
        .locator('input[placeholder*="أكد البريد"]')
        .first()
        .fill(email);

      // Gender
      await this.page
        .locator("select#gender, select[name*='gender']")
        .first()
        .selectOption(gender === "male" ? "ذكر" : "أنثى");

      // Nationality - jQuery multiselect
      const natCombo = this.page.locator(
        ".ms-options-wrap button, [aria-label*='الجنسية']"
      );
      if ((await natCombo.count()) > 0) {
        await natCombo.first().click();
        await this.page
          .locator(`role=treeitem[name="${nationality}"]`)
          .click();
      }

      // Governorate
      await this.page.waitForTimeout(500);
      const govCombo = this.page
        .locator(".ms-options-wrap button")
        .or(this.page.locator("[aria-label*='المحافظة']"));
      if ((await govCombo.count()) > 1) {
        await govCombo.nth(1).click();
        await this.page
          .locator(`role=treeitem[name="${governorate}"]`)
          .click();
      }

      // Birth date (readonly - need JS)
      await this.page.evaluate((date) => {
        const el = document.getElementById("birthdate") as HTMLInputElement;
        if (el) {
          el.removeAttribute("readonly");
          el.value = date;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, birthDate);

      // Area
      await this.page.waitForTimeout(500);
      const areaCombo = this.page
        .locator(".ms-options-wrap button")
        .or(this.page.locator("[aria-label*='المنطقة']"));
      if ((await areaCombo.count()) > 2) {
        await areaCombo.nth(2).click();
        await this.page.locator(`role=treeitem[name="${area}"]`).click();
      }

      // Password
      await this.page
        .locator('input[placeholder*="إدخال كلمة السر"]')
        .first()
        .fill(password);
      await this.page
        .locator('input[placeholder*="تأكيد كلمة السر"]')
        .first()
        .fill(password);

      // Submit step 1
      const saveBtn = this.page.locator("button.next.wizard-button");
      await saveBtn.click();
      await this.page.waitForTimeout(2000);

      // Step 2: University (optional) - skip
      console.log("[bot] Step 2: Skipping university step...");
      const continueBtn = this.page.locator("button.next.wizard-button");
      if ((await continueBtn.count()) > 0) {
        await continueBtn.click();
        await this.page.waitForTimeout(2000);
      }

      // Step 3: Education + Skills
      console.log("[bot] Step 3: Setting education & skills...");
      await this.page.evaluate(() => {
        // Education level = University
        const edu = document.getElementById(
          "newsettings_education_lvl_id"
        ) as HTMLSelectElement;
        if (edu) {
          edu.value = "6";
          edu.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Crisis volunteering = Yes
        const crisis = document.querySelector(
          'input[name="volunteer_during_crises"][value="1"]'
        ) as HTMLInputElement;
        if (crisis) crisis.click();

        // Select skills through multiselect plugin
        document
          .querySelectorAll(".ms-options-wrap")
          .forEach((wrap) => {
            const btn = wrap.querySelector("button") as HTMLButtonElement;
            if (btn) btn.click();
            const cbs = wrap.querySelectorAll(
              'input[type="checkbox"]'
            ) as NodeListOf<HTMLInputElement>;
            let count = 0;
            cbs.forEach((cb) => {
              const label = cb.closest("label")?.textContent?.trim() || "";
              if (label.includes("لا امتلك")) return;
              if (count < 2) {
                cb.click();
                count++;
              }
            });
            if (btn) btn.click();
          });
      });

      await this.page.waitForTimeout(500);
      const step3Btn = this.page.locator("button.next.wizard-button");
      if ((await step3Btn.count()) > 0) {
        await step3Btn.click();
        await this.page.waitForTimeout(2000);
      }

      // Step 4: Employment + Categories
      console.log("[bot] Step 4: Final step...");
      await this.page.evaluate(() => {
        // Not employed
        const noWork = document.querySelector(
          'input[name="employee"][value="0"]'
        ) as HTMLInputElement;
        if (noWork) noWork.click();

        // Select preferred categories
        const catWrap = document.querySelector(".ms-options-wrap");
        if (catWrap) {
          const btn = catWrap.querySelector("button") as HTMLButtonElement;
          if (btn) btn.click();
          const cbs = catWrap.querySelectorAll(
            'input[type="checkbox"]'
          ) as NodeListOf<HTMLInputElement>;
          let count = 0;
          cbs.forEach((cb) => {
            if (count < 3) {
              cb.click();
              count++;
            }
          });
          if (btn) btn.click();
        }
      });

      await this.page.waitForTimeout(500);

      // Click "إنشاء حساب" (Create Account)
      const createBtn = this.page.locator(
        'button:has-text("إنشاء حساب")'
      );
      if ((await createBtn.count()) > 0) {
        await createBtn.click();
        await this.page.waitForTimeout(5000);
      }

      const finalText = await this.page.evaluate(
        () => document.body?.innerText?.substring(0, 500) || ""
      );
      const finalUrl = this.page.url();

      if (
        finalText.includes("Failed") ||
        finalText.includes("خطأ") ||
        finalText.includes("فشل")
      ) {
        return {
          success: false,
          message:
            "Registration failed - server rejected (anti-bot protection)",
        };
      }

      if (
        finalUrl.includes("/dashboard") ||
        finalUrl.includes("/profile") ||
        finalText.includes("تم إنشاء") ||
        finalText.includes("بنجاح")
      ) {
        return { success: true, message: "Account created successfully" };
      }

      return {
        success: false,
        message: "Registration status uncertain: " + finalUrl,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[bot] Registration error:", msg);
      return { success: false, message: `Registration error: ${msg}` };
    }
  }

  // ─── Full Flow: Login + Apply ─────────────────────

  async loginAndApply(
    email: string,
    password: string,
    opportunityUrl: string
  ): Promise<ApplyResult> {
    const loginResult = await this.login(email, password);
    if (!loginResult.success) {
      return {
        success: false,
        message: `Cannot apply: ${loginResult.message}`,
      };
    }

    return this.applyToOpportunity(opportunityUrl);
  }
}

// ─── CLI Entry Point ──────────────────────────────────

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command) {
    console.log(`
Nahno Volunteer Bot - Takafol Platform

Commands:
  login <email> <password>                    - Test login
  apply <email> <password> <opportunityUrl>   - Login & apply
  register <firstName> <lastName> <email> <password> - Register new account
    `);
    process.exit(0);
  }

  const bot = new NahnoBot({ headless: true });

  try {
    await bot.init();

    switch (command) {
      case "login": {
        const [email, password] = args;
        if (!email || !password) {
          console.error("Usage: login <email> <password>");
          process.exit(1);
        }
        const result = await bot.login(email, password);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case "apply": {
        const [email, password, url] = args;
        if (!email || !password || !url) {
          console.error("Usage: apply <email> <password> <opportunityUrl>");
          process.exit(1);
        }
        const result = await bot.loginAndApply(email, password, url);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case "register": {
        const [firstName, lastName, email, password] = args;
        if (!firstName || !lastName || !email || !password) {
          console.error(
            "Usage: register <firstName> <lastName> <email> <password>"
          );
          process.exit(1);
        }
        const result = await bot.register(
          firstName,
          lastName,
          email,
          password
        );
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } finally {
    await bot.close();
  }
}

main().catch((err) => {
  console.error("[bot] Fatal error:", err);
  process.exit(1);
});
