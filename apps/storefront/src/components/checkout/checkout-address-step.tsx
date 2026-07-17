"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputIcon } from "@/components/ui/input-icon";
import { Hash, MapPin, Phone, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  updateCartContact,
  listShippingOptions,
  type CheckoutAddress,
  type ShippingOption,
} from "@/lib/medusa/cart-client";
import CitySelector, { SelectorOptionType } from "./city-combobox";
import citiesjson from "@/lib/static-data/cities.json";
import provincesjson from "@/lib/static-data/provinces.json";

interface CheckoutAddressStepProps {
  initialAddress: CheckoutAddress;
  customer: { email: string } | null;
  onAddressSubmitted: (shippingOptions: ShippingOption[]) => void;
}

export function CheckoutAddressStep({
  initialAddress,
  customer,
  onAddressSubmitted,
}: CheckoutAddressStepProps) {
  const tCheckout = useTranslations("checkout");
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);

  const provinces: SelectorOptionType[] = provincesjson.provinces.map((c) => ({
    label: c.name,
    value: `${c.code}`,
  }));

  const cities: SelectorOptionType[] = citiesjson.cities
    .filter((c) => c.provice_id === address.province)
    .map((c) => ({
      label: c.name,
      value: c.slug,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !address.first_name ||
      !address.last_name ||
      !address.address_1 ||
      !address.city ||
      !address.postal_code ||
      !address.country_code
    ) {
      toast.error(tCheckout("fillRequired"));
      return;
    }

    setSubmitting(true);
    try {
      if (!customer || !customer.email) {
        throw new Error(tCheckout("errors.emailRequired"));
      }

      await updateCartContact({
        email: customer.email,
        shipping_address: address,
      });

      const options = await listShippingOptions();
      onAddressSubmitted(options);
    } catch (err) {
      console.error(err);
      toast.error(tCheckout("cantSaveAddress"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-6 p-6">
          <h2 className="text-lg font-semibold">
            {tCheckout("shippingAddress")}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="first_name">
                {tCheckout("form.firstName")}
              </FieldLabel>
              <InputIcon
                id="first_name"
                startIcon={User}
                value={address.first_name}
                onChange={(e) =>
                  setAddress({ ...address, first_name: e.target.value })
                }
                required
                placeholder={tCheckout("form.firstName")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="last_name">
                {tCheckout("form.lastName")}
              </FieldLabel>
              <InputIcon
                id="last_name"
                startIcon={User}
                value={address.last_name}
                onChange={(e) =>
                  setAddress({ ...address, last_name: e.target.value })
                }
                required
                placeholder={tCheckout("form.lastName")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="address_1">
              {tCheckout("form.addressLine1")}
            </FieldLabel>
            <InputIcon
              id="address_1"
              startIcon={MapPin}
              value={address.address_1}
              onChange={(e) =>
                setAddress({ ...address, address_1: e.target.value })
              }
              required
              placeholder="خیابان کشاورز ،  ..."
            />
          </Field>

          {/* <Field>
            <FieldLabel htmlFor="address_2">
              {tCheckout("form.addressLine2")}
            </FieldLabel>
            <InputIcon
              id="address_2"
              startIcon={MapPin}
              value={address.address_2 ?? ""}
              onChange={(e) =>
                setAddress({ ...address, address_2: e.target.value })
              }
              placeholder="Apartment, suite, etc."
            />
          </Field> */}

          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="city">
                {tCheckout("form.stateProvince")}
              </FieldLabel>
              <CitySelector
                data={provinces}
                buttonLabel="نام استان ..."
                onChange={(v) => setAddress({ ...address, province: v })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="city">{tCheckout("form.city")}</FieldLabel>
              <CitySelector
                data={cities}
                buttonLabel="نام شهر ..."
                onChange={(v) => setAddress({ ...address, city: v })}
              />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* <Field>
              <FieldLabel htmlFor="country_code">
                {tCheckout("form.country")}
              </FieldLabel>
              <InputIcon
                id="country_code"
                startIcon={Globe}
                value={address.country_code}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    country_code: e.target.value.toLowerCase(),
                  })
                }
                required
                placeholder="IR"
              />
            </Field> */}

            <Field>
              <FieldLabel htmlFor="postal_code">
                {tCheckout("form.postalCode")}
              </FieldLabel>
              <InputIcon
                id="postal_code"
                endIcon={Hash}
                value={address.postal_code}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    postal_code: e.target.value,
                  })
                }
                required
                placeholder="12345678"
                dir="ltr"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">{tCheckout("form.phone")}</FieldLabel>
              <InputIcon
                id="phone"
                endIcon={Phone}
                value={address.phone ?? ""}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                placeholder="+98 912 345 6789"
                dir="ltr"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting
          ? tCheckout("actions.saving")
          : tCheckout("actions.continueToShipping")}
      </Button>
    </form>
  );
}
