/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import Bills from "../containers/Bills.js";
import store from "../app/Store.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			// WHY DO THIS ?
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			// END QUESTION
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));
			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.classList).toContain("active-icon");
		});
		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);
			expect(dates).toEqual(datesSorted);
		});
	});

	describe("I click on the new bill button", () => {
		test("Then I should be redirected to the new bill page", () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			// document.body.innerHTML = DashboardFormUI(bills[0]);

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			// const store = null;

			const billsObj = new Bills({ document, onNavigate, store, localStorage });
			const newBillButton = screen.getByTestId("btn-new-bill");
			const handleNewBill = jest.fn(() => billsObj.handleClickNewBill());
			newBillButton.addEventListener("click", handleNewBill);
			fireEvent.click(newBillButton);
			expect(handleNewBill).toHaveBeenCalled();
			const title = screen.getByText(/Envoyer une note de frais/);
			expect(title).toBeTruthy();
		});
	});

	describe("When I click on the eye icon button", () => {
		test("the modale should be visible", () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			document.body.innerHTML = BillsUI({ data: bills });

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const billsObj = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const modale = document.getElementById("modaleFile");
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			const eyeBtn = screen.getAllByTestId("icon-eye")[0];
			const handleClickEyeBtn = jest.fn(() =>
				billsObj.handleClickIconEye(eyeBtn)
			);
			eyeBtn.addEventListener("click", handleClickEyeBtn);
			userEvent.click(eyeBtn);

			expect(handleClickEyeBtn).toHaveBeenCalled();
			expect(modale.classList).toContain("show");
			expect(screen.getByText("Justificatif")).toBeTruthy();
			expect(bills[0].fileUrl).toBeTruthy();
		});
	});
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bills", () => {
		test("fetches bills from mock API GET", async () => {
			localStorage.setItem(
				"user",
				JSON.stringify({ type: "Employee", email: "a@a" })
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByText("Mes notes de frais"));
			const tableTitle = await screen.getByText("Statut");
			expect(tableTitle).toBeTruthy();
			const tableContent = await screen.getByTestId("tbody");
			expect(tableContent).toBeTruthy();
			expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
		});
		test("recover bills from API", async () => {
			const bills = await mockStore.bills().list();
			expect(bills.length).toBe(4);
		});
		describe("When an error occurs on API", () => {
			beforeEach(() => {
				jest.spyOn(mockStore, "bills");
				Object.defineProperty(window, "localStorage", {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
						email: "a@a",
					})
				);
				const root = document.createElement("div");
				root.setAttribute("id", "root");
				document.body.appendChild(root);
				router();
			});
			test("fetches bills from an API and fails with 404 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 404"));
						},
					};
				});
				document.body.innerHTML = BillsUI({ error: "Erreur 404" });
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 404/);
				expect(message).toBeTruthy();
			});

			test("fetches messages from an API and fails with 500 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 500"));
						},
					};
				});
				document.body.innerHTML = BillsUI({ error: "Erreur 500" });
				await new Promise(process.nextTick);
				const message = await screen.getByText(/Erreur 500/)
				expect(message).toBeTruthy()
			});
		});
	});
});
