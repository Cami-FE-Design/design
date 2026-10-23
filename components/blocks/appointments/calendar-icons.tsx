import {
  CarFrontIcon,
  FileTextIcon,
  type LucideIcon,
  MapPinIcon,
  PlayIcon,
  RotateCwIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react"
import type { ComponentType } from "react"
import type { CardIconKey } from "@/lib/appointments/card-icons"

// The calendar card's icons (DZ-425). The ten states in Figma (Component 9,
// node 111:13998) are inlined from that file with `currentColor`, so each glyph
// takes the card's text colour like the Lucide icons beside it. States with no
// Figma icon (arrived, started, the flags) stay on Lucide, as they are in the
// built product.

type IconProps = { className?: string }

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** requested: the client asked for this team member. Filled heart. */
function RequestedIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M12.6654 9.33333C13.6587 8.36 14.6654 7.19333 14.6654 5.66667C14.6654 4.69421 14.2791 3.76158 13.5914 3.07394C12.9038 2.38631 11.9712 2 10.9987 2C9.82536 2 8.9987 2.33333 7.9987 3.33333C6.9987 2.33333 6.17203 2 4.9987 2C4.02624 2 3.09361 2.38631 2.40597 3.07394C1.71834 3.76158 1.33203 4.69421 1.33203 5.66667C1.33203 7.2 2.33203 8.36667 3.33203 9.33333L7.9987 14L12.6654 9.33333Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

/** confirmed: thumbs up (Phosphor, drawn on a 256 grid). */
function ConfirmedIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="16"
      className={className}
      aria-hidden="true"
    >
      <path d="M32,104H80a0,0,0,0,1,0,0V208a0,0,0,0,1,0,0H32a8,8,0,0,1-8-8V112A8,8,0,0,1,32,104Z" />
      <path d="M80,104l40-80a32,32,0,0,1,32,32V80h64a16,16,0,0,1,15.87,18l-12,96A16,16,0,0,1,204,208H80" />
    </svg>
  )
}

/** cancelled: crossed-out calendar. */
function CancelledIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5.33333 1.33301V3.99967M10.6667 1.33301V3.99967M2 6.66634H14M9.33333 9.33301L6.66667 11.9997M6.66667 9.33301L9.33333 11.9997M3.33333 2.66634H12.6667C13.403 2.66634 14 3.26329 14 3.99967V13.333C14 14.0694 13.403 14.6663 12.6667 14.6663H3.33333C2.59695 14.6663 2 14.0694 2 13.333V3.99967C2 3.26329 2.59695 2.66634 3.33333 2.66634Z" />
    </Svg>
  )
}

/** no-show: eye with a slash. */
function NoShowIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.58529 6.58626C6.38879 6.76936 6.23118 6.99016 6.12187 7.23549C6.01256 7.48083 5.95378 7.74566 5.94904 8.0142C5.9443 8.28274 5.9937 8.54949 6.09429 8.79852C6.19488 9.04756 6.3446 9.27378 6.53452 9.4637C6.72443 9.65361 6.95066 9.80333 7.19969 9.90392C7.44873 10.0045 7.71547 10.0539 7.98401 10.0492C8.25255 10.0444 8.51739 9.98566 8.76272 9.87634C9.00805 9.76703 9.22885 9.60943 9.41195 9.41293M7.15202 3.38634C7.43289 3.35135 7.71564 3.33354 7.99868 3.33301C12.6654 3.33301 14.6654 7.99967 14.6654 7.99967C14.3673 8.63776 13.9935 9.23763 13.552 9.78634M4.40536 4.40641C3.07953 5.30949 2.01861 6.54992 1.33203 7.99975C1.33203 7.99975 3.33203 12.6664 7.9987 12.6664C9.27597 12.6698 10.5259 12.2965 11.592 11.5931M1.33203 1.33301L14.6654 14.6663" />
    </Svg>
  )
}

/** online_booking: cloud. */
function OnlineBookingIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11.6681 12.6663H6.00141C5.13599 12.6661 4.28767 12.4253 3.55126 11.9707C2.81485 11.5161 2.21936 10.8656 1.83132 10.0921C1.44329 9.31853 1.278 8.45231 1.35394 7.59022C1.42987 6.72814 1.74403 5.90415 2.26131 5.21033C2.77859 4.51651 3.47861 3.9802 4.28314 3.66133C5.08768 3.34246 5.96504 3.25359 6.81718 3.40465C7.66931 3.55571 8.46266 3.94075 9.10856 4.51675C9.75447 5.09274 10.2275 5.83699 10.4747 6.66634H11.6681C12.4637 6.66634 13.2268 6.98241 13.7894 7.54502C14.352 8.10763 14.6681 8.87069 14.6681 9.66634C14.6681 10.462 14.352 11.2251 13.7894 11.7877C13.2268 12.3503 12.4637 12.6663 11.6681 12.6663Z" />
    </Svg>
  )
}

/** confirmed_with_card: deposit collected. Card. */
function DepositIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M1.33203 6.66634H14.6654M2.66536 3.33301H13.332C14.0684 3.33301 14.6654 3.92996 14.6654 4.66634V11.333C14.6654 12.0694 14.0684 12.6663 13.332 12.6663H2.66536C1.92898 12.6663 1.33203 12.0694 1.33203 11.333V4.66634C1.33203 3.92996 1.92898 3.33301 2.66536 3.33301Z" />
    </Svg>
  )
}

/** packages: a package session redeemed on this appointment. Calendar with a clock. */
function PackageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5.33333 1.33333V4M10.6667 1.33333V4M14 8.03435V4C14 3.26362 13.403 2.66667 12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H7.01052M2 6.66667H14" />
      <path d="M10.8927 10.6838V11.7671L11.5643 12.4387M13.9993 11.5612C13.9993 13.2761 12.6091 14.6663 10.8942 14.6663C9.17926 14.6663 7.78906 13.2761 7.78906 11.5612C7.78906 9.84626 9.17926 8.45605 10.8942 8.45605C12.6091 8.45605 13.9993 9.84626 13.9993 11.5612Z" />
    </Svg>
  )
}

const RING =
  "M7.99902 1.83301C11.4046 1.83318 14.165 4.59435 14.165 8C14.1649 11.4055 11.4045 14.1658 7.99902 14.166C4.59338 14.166 1.83221 11.4056 1.83203 8C1.83203 4.59424 4.59327 1.83301 7.99902 1.83301ZM7.99902 2.16602C4.77736 2.16602 2.16504 4.77834 2.16504 8C2.16521 11.2215 4.77747 13.833 7.99902 13.833C11.2204 13.8328 13.8319 11.2214 13.832 8C13.832 4.77845 11.2206 2.16619 7.99902 2.16602Z"

/** draft: a sale is open with nothing paid. Empty ring. */
function SaleDraftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d={RING} fill="currentColor" />
      <path d="M8 4.5C9.93299 4.5 11.5 6.067 11.5 8C11.5 9.93299 9.93299 11.5 8 11.5C6.067 11.5 4.5 9.93299 4.5 8C4.5 6.067 6.067 4.5 8 4.5Z" />
    </Svg>
  )
}

/** partially_paid: half-filled ring. */
function SalePartialIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d={`${RING}M8.49902 4.53516C10.195 4.77791 11.499 6.23688 11.499 8C11.4988 9.93273 9.93176 11.4998 7.99902 11.5C7.21225 11.5 6.48597 11.241 5.90137 10.8027L8.35254 8.35352L8.49902 8.20703V4.53516Z`}
        fill="currentColor"
      />
    </Svg>
  )
}

/** fully_paid: filled ring. */
function SalePaidIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d={`${RING}M7.99902 4.5C9.93186 4.50018 11.499 6.06711 11.499 8C11.4988 9.93273 9.93176 11.4998 7.99902 11.5C6.06614 11.5 4.4992 9.93284 4.49902 8C4.49902 6.067 6.06603 4.5 7.99902 4.5Z`}
        fill="currentColor"
      />
    </Svg>
  )
}

// Lucide draws on a 24 grid, so at 16px its default stroke is 1.33px against
// Figma's 1px. 1.5 on the 24 grid lands on the same 1px line.
function thin(Icon: LucideIcon): ComponentType<IconProps> {
  return function ThinIcon({ className }: IconProps) {
    return <Icon className={className} strokeWidth={1.5} aria-hidden />
  }
}

export const CARD_ICON: Record<CardIconKey, ComponentType<IconProps>> = {
  "sale-draft": SaleDraftIcon,
  "sale-partial": SalePartialIcon,
  "sale-paid": SalePaidIcon,
  deposit: DepositIcon,
  online: OnlineBookingIcon,
  requested: RequestedIcon,
  pickup: thin(CarFrontIcon),
  safety: thin(ShieldAlertIcon),
  note: thin(FileTextIcon),
  package: PackageIcon,
  recurring: thin(RotateCwIcon),
  links: thin(UsersIcon),
  confirmed: ConfirmedIcon,
  arrived: thin(MapPinIcon),
  started: thin(PlayIcon),
  "no-show": NoShowIcon,
  cancelled: CancelledIcon,
}
