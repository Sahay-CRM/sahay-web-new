import React, { useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useFormContext, RegisterOptions } from "react-hook-form";

interface OTPInputProps {
  name: string;
  length?: number;
  validation?: RegisterOptions;
  onComplete?: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({
  name,
  length = 4,
  validation = {},
  onComplete,
}) => {
  const { register, setValue, trigger, watch } = useFormContext();

  const otpValue = watch(name);

  // Watch for full OTP completion
  useEffect(() => {
    if (otpValue?.length === length) {
      onComplete?.(otpValue);
    }
  }, [otpValue, length, onComplete]);

  // Register hidden input to keep value in form state
  useEffect(() => {
    register(name, validation);
  }, [name, register, validation]);

  return (
    <InputOTP
      maxLength={length}
      value={otpValue || ""}
      onChange={(val) => {
        setValue(name, val);
        trigger(name);
      }}
    >
      <InputOTPGroup>
        {Array.from({ length }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
};

export default OTPInput;
