import { withOpacity } from '@pmndrs/uikit'

export const lightTheme = {
  component: {
    button: {
      primary: {
        background: {
          fill: {
            default: withOpacity('#272727', 1),
            hovered: withOpacity('#5a5a5a', 1),
            pressed: withOpacity('#747474', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        subtext: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          disabled: withOpacity('#ffffff', 0.6000000238418579),
        },
      },
      secondary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0.05000000074505806),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            disabled: withOpacity('#272727', 0.05000000074505806),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
      },
      tertiary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.15000000596046448),
            disabled: withOpacity('#272727', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
      },
      onMedia: {
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.10000000149011612),
            pressed: withOpacity('#ffffff', 0.20000000298023224),
            disabled: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
      },
      positive: {
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#0b8a1b', 1),
            hovered: withOpacity('#006622', 1),
            pressed: withOpacity('#003d1e', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
      negative: {
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#dd1535', 1),
            hovered: withOpacity('#aa0a1e', 1),
            pressed: withOpacity('#6d020a', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
    },
    selectionDropdown: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        ring: {
          stop1: withOpacity('#014ed0', 1),
          stop2: withOpacity('#31d3f3', 1),
        },
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
    },
    iconIndicator: {
      icon: {
        good: withOpacity('#ffffff', 0),
        poor: withOpacity('#ffffff', 0),
        bad: withOpacity('#ffffff', 0),
        none: withOpacity('#ffffff', 0),
      },
      background: {
        fill: {
          good: withOpacity('#0b8a1b', 1),
          poor: withOpacity('#a94302', 1),
          bad: withOpacity('#dd1535', 1),
          none: withOpacity('#272727', 1),
        },
      },
    },
    toggle: {
      background: {
        default: withOpacity('#272727', 0.3499999940395355),
        hovered: withOpacity('#272727', 0.44999998807907104),
        pressed: withOpacity('#272727', 0.550000011920929),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      handle: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.949999988079071),
        pressed: withOpacity('#ffffff', 1),
        selected: withOpacity('#ffffff', 1),
      },
    },
    checkbox: {
      selected: {
        background: {
          default: withOpacity('#272727', 0.3499999940395355),
          hover: withOpacity('#272727', 0.44999998807907104),
          pressed: withOpacity('#272727', 0.550000011920929),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#ffffff', 0),
          hover: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
    },
    radioButtons: {
      background: {
        default: withOpacity('#272727', 0.3499999940395355),
        hovered: withOpacity('#272727', 0.44999998807907104),
        pressed: withOpacity('#272727', 0.550000011920929),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0),
        pressed: withOpacity('#ffffff', 0),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    progressBar: {
      indeterminate: {
        background: {
          background: withOpacity('#272727', 0.10000000149011612),
        },
        fill: {
          stop1: withOpacity('#272727', 1),
          stop2: withOpacity('#5a5a5a', 1),
          stop3: withOpacity('#272727', 1),
        },
      },
      determinate: {
        fill: {
          fill: withOpacity('#272727', 1),
        },
        background: {
          background: withOpacity('#272727', 0.10000000149011612),
        },
      },
      quickReplies: {
        label: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            selected: withOpacity('#272727', 0.8999999761581421),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
        dividers: withOpacity('#272727', 0.10000000149011612),
      },
    },
    menu: {
      title: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#272727', 0.699999988079071),
        hovered: withOpacity('#272727', 0.699999988079071),
        pressed: withOpacity('#272727', 0.699999988079071),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
      },
      sectionHeader: withOpacity('#272727', 1),
      subtitle: {
        default: withOpacity('#272727', 0.699999988079071),
        hovered: withOpacity('#272727', 0.699999988079071),
        pressed: withOpacity('#272727', 0.699999988079071),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      toggle: {
        title: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#272727', 1),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0),
            pressed: withOpacity('#272727', 0),
            selected: withOpacity('#272727', 0),
          },
        },
        icon: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#272727', 0.699999988079071),
        },
        subtitle: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#272727', 0.699999988079071),
        },
      },
      labelIcon: {
        label: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
    },
    sideNavigation: {
      sideNavItem: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            selected: withOpacity('#272727', 1),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
      },
      label: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#272727', 1),
        },
        icon: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            selected: withOpacity('#272727', 0),
          },
          border: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
      },
    },
    badges: {
      primary: {
        background: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
      secondary: {
        background: withOpacity('#ffffff', 0.8999999761581421),
        label: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
      },
      positive: {
        background: withOpacity('#0b8a1b', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
      background: {
        background: withOpacity('#dd1535', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    imageCards: {
      background: {
        fill: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 0),
        },
        border: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0),
          pressed: withOpacity('#272727', 0),
          selected: withOpacity('#272727', 0),
        },
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
        metadata: withOpacity('#272727', 0.699999988079071),
        rating: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.699999988079071),
        },
        price: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.699999988079071),
        },
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    tiles: {
      label: {
        onMedia: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.699999988079071),
        },
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      icon: {
        onMedia: {
          primary: withOpacity('#ffffff', 1),
        },
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      eventHeader: {
        label: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          month: withOpacity('#dd1535', 1),
          date: withOpacity('#272727', 1),
        },
        background: {
          primary: withOpacity('#000000', 0.6000000238418579),
          date: withOpacity('#ffffff', 0.8999999761581421),
        },
        notification: {
          indicator: withOpacity('#dd1535', 1),
        },
      },
      background: {
        primary: withOpacity('#272727', 0.05000000074505806),
      },
      mediaThumbnail: {
        border: withOpacity('#272727', 0.10000000149011612),
      },
      check: {
        background: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#272727', 1),
      },
    },
    segmentedControl: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      selected: {
        background: withOpacity('#272727', 0.05000000074505806),
      },
    },
    progressRing: {
      background: {
        active: withOpacity('#272727', 1),
        inactive: withOpacity('#272727', 0.10000000149011612),
      },
      icon: {
        fill: withOpacity('#272727', 1),
      },
    },
    avatar: {
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
      focusRing: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
    },
    facepile: {
      label: withOpacity('#272727', 1),
    },
    peopleCard: {
      label: {
        secondary: withOpacity('#272727', 0.699999988079071),
        primary: withOpacity('#272727', 1),
        tertiary: withOpacity('#272727', 0.699999988079071),
      },
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
    },
    onMediaCheckbox: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0.20000000298023224),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
    },
    syncButton: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
      },
      progressRing: {
        background: withOpacity('#ffffff', 0.30000001192092896),
        fill: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    galleryTile: {
      icon: withOpacity('#ffffff', 1),
      label: withOpacity('#ffffff', 0.8999999761581421),
    },
    search: {
      label: withOpacity('#272727', 0.699999988079071),
      cursor: withOpacity('#0173ec', 1),
      background: {
        default: withOpacity('#272727', 0.05000000074505806),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        typing: withOpacity('#272727', 0.05000000074505806),
      },
      icon: withOpacity('#272727', 1),
    },
    slider: {
      label: withOpacity('#272727', 0.699999988079071),
      background: withOpacity('#272727', 0.05000000074505806),
      icon: withOpacity('#272727', 1),
      handle: {
        background: {
          hover: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
          default: withOpacity('#ffffff', 0),
        },
        icon: withOpacity('#ffffff', 0.8999999761581421),
        label: withOpacity('#ffffff', 0.8999999761581421),
      },
      foreground: {
        default: withOpacity('#272727', 1),
      },
    },
    typehead: {
      icon: withOpacity('#272727', 0.699999988079071),
      label: withOpacity('#272727', 0.699999988079071),
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.15000000596046448),
      },
    },
    inputKeys: {
      letter: {
        background: {
          default: withOpacity('#272727', 0.05000000074505806),
          pressed: withOpacity('#272727', 0.20000000298023224),
          hovered: withOpacity('#272727', 0.10000000149011612),
        },
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.30000001192092896),
        },
      },
      icon: {
        background: {
          default: withOpacity('#272727', 0.05000000074505806),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
        },
        icon: {
          default: withOpacity('#272727', 0.8999999761581421),
          hovered: withOpacity('#272727', 0.8999999761581421),
          pressed: withOpacity('#272727', 0.8999999761581421),
        },
      },
      alt: {
        background: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
        },
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.30000001192092896),
        },
      },
      primary: {
        background: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#5a5a5a', 1),
          pressed: withOpacity('#747474', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
      spaceBar: {
        background: {
          default: withOpacity('#272727', 0.05000000074505806),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
        },
      },
    },
    controlBar: {
      background: {
        default: withOpacity('#ffffff', 1),
        spatialMinimized: {
          fill: withOpacity('#ffffff', 1),
          border: withOpacity('#ffffff', 1),
        },
      },
      label: withOpacity('#272727', 1),
    },
    inputKeyboard: {
      background: {
        fill: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
        },
        border: withOpacity('#272727', 0.10000000149011612),
      },
      dividers: withOpacity('#272727', 0.10000000149011612),
      label: withOpacity('#272727', 0.699999988079071),
    },
    tooltip: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    infoCells: {
      background: withOpacity('#272727', 0.05000000074505806),
      icon: withOpacity('#272727', 0.699999988079071),
      subheadline: withOpacity('#272727', 0.699999988079071),
      label: withOpacity('#272727', 0.699999988079071),
    },
    listCells: {
      background: {
        default: withOpacity('#272727', 0.05000000074505806),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
        secondaryTextIcon: withOpacity('#272727', 0.699999988079071),
      },
      attribute: {
        primary: withOpacity('#272727', 1),
      },
    },
    auiNavigationBar: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      statusElements: {
        time: withOpacity('#272727', 0.699999988079071),
        wifi: withOpacity('#272727', 1),
        battery: withOpacity('#272727', 1),
      },
      divider: withOpacity('#272727', 0.10000000149011612),
    },
    achievementRow: {
      background: {
        default: withOpacity('#272727', 0),
      },
      label: {
        primary: withOpacity('#272727', 1),
        rating: withOpacity('#272727', 0.699999988079071),
        category: withOpacity('#272727', 0.699999988079071),
        description: withOpacity('#272727', 0.699999988079071),
        achievements: withOpacity('#272727', 0.699999988079071),
        progress: withOpacity('#272727', 1),
      },
      icon: {
        rating: withOpacity('#272727', 1),
      },
    },
    browserTab: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    browserToolBar: {
      icon: withOpacity('#272727', 0.699999988079071),
    },
    browserTopBar: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    dialogModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
        link: withOpacity('#0173ec', 1),
      },
      icon: {
        primary: withOpacity('#272727', 1),
      },
    },
    fullPanelModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    heroImage: {
      label: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.699999988079071),
      },
      pagination: {
        active: withOpacity('#ffffff', 0.8999999761581421),
        inactive: withOpacity('#ffffff', 0.30000001192092896),
      },
    },
    listHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    mediaControls: {
      icon: {
        icon: withOpacity('#ffffff', 0.8999999761581421),
        progressBar: {
          foreground: withOpacity('#ffffff', 0.8999999761581421),
          background: withOpacity('#ffffff', 0.30000001192092896),
        },
      },
      playButton: {
        background: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#272727', 1),
      },
    },
    inputField: {
      label: withOpacity('#272727', 0.699999988079071),
      icon: withOpacity('#272727', 0.699999988079071),
      inputField: withOpacity('#272727', 0.05000000074505806),
      background: {
        default: withOpacity('#272727', 0.05000000074505806),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
      },
    },
    popover: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: withOpacity('#272727', 1),
    },
    sectionHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    scrollbars: {
      background: {
        fill: withOpacity('#272727', 1),
      },
    },
    bottomButton: {
      label: {
        primary: withOpacity('#272727', 0.699999988079071),
        link: withOpacity('#0173ec', 1),
      },
    },
    sidesheet: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      divider: withOpacity('#272727', 0.10000000149011612),
    },
    toast: {
      toast: {
        background: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
          delete: withOpacity('#dd1535', 1),
          label: {
            primary: withOpacity('#272727', 1),
            secondary: withOpacity('#272727', 0.699999988079071),
          },
          icon: {
            primary: withOpacity('#272727', 1),
          },
        },
        slider: {
          background: withOpacity('#272727', 0.10000000149011612),
          forground: withOpacity('#272727', 1),
        },
      },
    },
    reactionPill: {
      background: {
        border: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
        },
        fill: withOpacity('#f2f2f2', 1),
      },
      label: withOpacity('#272727', 1),
    },
    chatBubble: {
      sender: {
        fill: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 1),
      },
      responder: {
        fill: withOpacity('#f2f2f2', 1),
        label: withOpacity('#272727', 1),
      },
    },
    avatarTile: {
      background: withOpacity('#272727', 0.05000000074505806),
      selectedBorder: withOpacity('#272727', 1),
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      multiselect: {
        background: withOpacity('#272727', 1),
        icon: withOpacity('#f2f2f2', 1),
        border: withOpacity('#ffffff', 1),
      },
      icon: withOpacity('#272727', 1),
      reward: {
        background: withOpacity('#000000', 0.05000000074505806),
        gradient: withOpacity('#6441d2', 1),
        label: {
          primary: withOpacity('#272727', 1),
          secondary: withOpacity('#272727', 0.699999988079071),
        },
        slider: {
          background: withOpacity('#e2e4ea', 1),
          foreground: withOpacity('#6441d2', 1),
        },
        icon: withOpacity('#272727', 0.699999988079071),
      },
    },
    avatarSideNav: {
      background: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      attribute: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    avatarLoader: {
      fill: withOpacity('#272727', 1),
      background: withOpacity('#272727', 0.10000000149011612),
    },
    avatarColorPickerSwatch: {
      selectedState: withOpacity('#272727', 1),
      icon: withOpacity('#ffffff', 0.8999999761581421),
      noneBackground: withOpacity('#272727', 1),
    },
    avatarSlider: {
      label: withOpacity('#272727', 1),
      icon: withOpacity('#272727', 0.699999988079071),
      slider: {
        background: withOpacity('#272727', 0.05000000074505806),
        label: withOpacity('#272727', 0.699999988079071),
        icon: withOpacity('#272727', 1),
        foreground: {
          default: withOpacity('#272727', 0.8999999761581421),
        },
        handle: {
          icon: withOpacity('#ffffff', 0.8999999761581421),
          label: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
      background: withOpacity('#272727', 0.05000000074505806),
    },
    avatarSectionHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      icon: withOpacity('#272727', 1),
    },
    avatarSegmentedControl: {
      background: {
        chips: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        picker: {
          default: withOpacity('#272727', 0.05000000074505806),
        },
      },
      icon: {
        default: withOpacity('#272727', 0.699999988079071),
        hovered: withOpacity('#272727', 0.8500000238418579),
        pressed: withOpacity('#272727', 0.8999999761581421),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      label: {
        default: withOpacity('#272727', 0.699999988079071),
        hovered: withOpacity('#272727', 0.699999988079071),
        pressed: withOpacity('#272727', 0.699999988079071),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      selected: {
        background: withOpacity('#272727', 0.05000000074505806),
      },
    },
    emptyStateIllustration: {
      icon: {
        primary: withOpacity('#272727', 0.5),
        secondary: withOpacity('#272727', 0.8999999761581421),
      },
      abstractStars: withOpacity('#272727', 0.15000000596046448),
      shimmer: withOpacity('#272727', 0.07999999821186066),
    },
    navigationOverflowMenu: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        disabled: withOpacity('#272727', 0.30000001192092896),
      },
      icon: {
        default: withOpacity('#272727', 0.699999988079071),
        hovered: withOpacity('#272727', 0.699999988079071),
        pressed: withOpacity('#272727', 0.699999988079071),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        disabled: withOpacity('#272727', 0.30000001192092896),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
    },
    navigationSystemBar: {
      elementsButton: {
        icon: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          green: withOpacity('#ffffff', 1),
          blue: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
        },
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
          number: withOpacity('#ffffff', 1),
          status: withOpacity('#ffffff', 1),
        },
        green: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        blue: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        number: {
          label: withOpacity('#ffffff', 1),
        },
        badge: {
          fill: {
            privacyOn: withOpacity('#ffffff', 1),
            open: withOpacity('#ffffff', 1),
            recording: withOpacity('#ffffff', 1),
          },
        },
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
        },
      },
      personalDisplayBar: {
        chin: withOpacity('#ffffff', 1),
        defaultElementsButton: withOpacity('#ffffff', 1),
      },
      navigationChevron: {
        chevron: withOpacity('#ffffff', 1),
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      dividers: withOpacity('#ffffff', 1),
      time: withOpacity('#ffffff', 1),
      worldPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      appPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      avatarPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      homeIcon: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
        icon: withOpacity('#ffffff', 1),
      },
      sectionHeader: withOpacity('#000000', 1),
    },
    textInput: {
      label: {
        default: withOpacity('#272727', 0.699999988079071),
        hover: withOpacity('#272727', 0.699999988079071),
        pressed: withOpacity('#272727', 0.699999988079071),
        typing: withOpacity('#272727', 1),
      },
      cursor: withOpacity('#0173ec', 1),
      icon: withOpacity('#272727', 0.699999988079071),
      background: {
        default: withOpacity('#272727', 0.05000000074505806),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        typing: withOpacity('#272727', 0.05000000074505806),
      },
    },
    navigationAppTile: {
      label: {
        primary: withOpacity('#ffffff', 1),
        secondary: withOpacity('#ffffff', 1),
      },
      attribute: withOpacity('#ffffff', 1),
      activeIndicator: withOpacity('#ffffff', 1),
      navigationUninstalledStates: {
        label: withOpacity('#ffffff', 1),
        iconButton: {
          download: {
            fill: withOpacity('#ffffff', 1),
            icon: withOpacity('#ffffff', 1),
          },
          queued: {
            stroke: withOpacity('#ffffff', 1),
          },
          queuedHover: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          cancel: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          downloadingProgress: {
            stroke: {
              inactiveStroke: withOpacity('#ffffff', 1),
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          installing: {
            stroke: {
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          redeem: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          view: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          update: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
        },
      },
      uninstalledScrim: withOpacity('#ffffff', 1),
    },
  },
  semantic: {
    ui: {
      focusring: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      primary: {
        text: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
        background: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#5a5a5a', 1),
          pressed: withOpacity('#747474', 1),
        },
      },
      secondary: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#272727', 0.05000000074505806),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
        },
      },
      tertiary: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#272727', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.15000000596046448),
        },
      },
      disabled: {
        text: withOpacity('#f2f2f2', 1),
        icon: withOpacity('#f2f2f2', 1),
        background: {
          default: withOpacity('#c0c0c0', 1),
          hovered: withOpacity('#c0c0c0', 1),
          pressed: withOpacity('#c0c0c0', 1),
        },
      },
      selected: {
        text: withOpacity('#f2f2f2', 1),
        icon: withOpacity('#f2f2f2', 1),
        background: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#000000', 0.8999999761581421),
          pressed: withOpacity('#000000', 0.949999988079071),
        },
      },
      deselected: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#272727', 0.05000000074505806),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.15000000596046448),
        },
      },
      onMedia: {
        text: withOpacity('#f2f2f2', 1),
        icon: withOpacity('#f2f2f2', 1),
        background: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
      },
    },
    status: {
      notification: withOpacity('#0173ec', 1),
      hidden: withOpacity('#8e8e8e', 1),
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      warning: withOpacity('#a94302', 1),
      privacy: withOpacity('#6441d2', 1),
    },
    text: {
      primary: withOpacity('#272727', 1),
      secondary: withOpacity('#272727', 0.699999988079071),
      placeholder: withOpacity('#272727', 0.30000001192092896),
      disabled: withOpacity('#272727', 0.30000001192092896),
      link: withOpacity('#0173ec', 1),
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      warning: withOpacity('#a94302', 1),
      primaryOnMedia: withOpacity('#ffffff', 0.8999999761581421),
      secondaryOnMedia: withOpacity('#ffffff', 0.699999988079071),
    },
    icon: {
      primary: withOpacity('#272727', 1),
      secondary: withOpacity('#272727', 0.699999988079071),
      placeholder: withOpacity('#272727', 0.30000001192092896),
      disabled: withOpacity('#272727', 0.30000001192092896),
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      warning: withOpacity('#a94302', 1),
      onMedia: withOpacity('#ffffff', 0.8999999761581421),
      secondaryOnMedia: withOpacity('#ffffff', 0.699999988079071),
    },
    background: {
      primary: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      privacy: withOpacity('#6441d2', 1),
      ui: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.05000000074505806),
      },
    },
    shadows: {
      punchedIn: {
        dropShadow: withOpacity('#ffffff', 1),
        innerShadow: withOpacity('#272727', 0.05000000074505806),
      },
      beveled: {
        left: withOpacity('#ffffff', 1),
        right: withOpacity('#272727', 0.05000000074505806),
      },
      dropShadow: {
        innerShadow: {
          left: withOpacity('#ffffff', 1),
          right: withOpacity('#272727', 0.05000000074505806),
        },
        dropShadow: {
          top: withOpacity('#272727', 0.05000000074505806),
          bottom: withOpacity('#272727', 0.05000000074505806),
        },
      },
      panel: {
        innerShadow: withOpacity('#272727', 0.10000000149011612),
        innerShadow2: withOpacity('#ffffff', 1),
      },
    },
  },
} as const

export const darkTheme = {
  component: {
    button: {
      primary: {
        background: {
          fill: {
            default: withOpacity('#272727', 1),
            hovered: withOpacity('#5a5a5a', 1),
            pressed: withOpacity('#747474', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
        subtext: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
      },
      secondary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0.05000000074505806),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            disabled: withOpacity('#272727', 0.05000000074505806),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#272727', 0.699999988079071),
          hovered: withOpacity('#272727', 0.699999988079071),
          pressed: withOpacity('#272727', 0.699999988079071),
          disabled: withOpacity('#272727', 0.699999988079071),
        },
      },
      tertiary: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0.30000001192092896),
        },
        background: {
          fill: {
            default: withOpacity('#272727', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.15000000596046448),
            disabled: withOpacity('#272727', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          disabled: withOpacity('#ffffff', 0.699999988079071),
        },
      },
      onMedia: {
        label: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.10000000149011612),
            pressed: withOpacity('#ffffff', 0.20000000298023224),
            disabled: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#ffffff', 0.3499999940395355),
        },
      },
      positive: {
        label: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#0b8a1b', 1),
            hovered: withOpacity('#006622', 1),
            pressed: withOpacity('#003d1e', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
      negative: {
        label: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          disabled: withOpacity('#f2f2f2', 1),
        },
        background: {
          fill: {
            default: withOpacity('#dd1535', 1),
            hovered: withOpacity('#f45b6b', 1),
            pressed: withOpacity('#ec374e', 1),
            disabled: withOpacity('#c0c0c0', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
          },
        },
        subtext: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          disabled: withOpacity('#f2f2f2', 1),
        },
      },
    },
    selectionDropdown: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        ring: {
          stop1: withOpacity('#014ed0', 1),
          stop2: withOpacity('#31d3f3', 1),
        },
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        border: {
          default: withOpacity('#000000', 0),
          hovered: withOpacity('#000000', 0),
          pressed: withOpacity('#000000', 0),
          selected: withOpacity('#000000', 0),
        },
      },
    },
    iconIndicator: {
      icon: {
        good: withOpacity('#000000', 0),
        poor: withOpacity('#000000', 0),
        bad: withOpacity('#000000', 0),
        none: withOpacity('#000000', 0),
      },
      background: {
        fill: {
          good: withOpacity('#0b8a1b', 1),
          poor: withOpacity('#a94302', 1),
          bad: withOpacity('#dd1535', 1),
          none: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
    },
    toggle: {
      background: {
        default: withOpacity('#ffffff', 0.15000000596046448),
        hovered: withOpacity('#ffffff', 0.25),
        pressed: withOpacity('#ffffff', 0.3499999940395355),
        selected: withOpacity('#000000', 1),
      },
      handle: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.949999988079071),
        pressed: withOpacity('#ffffff', 1),
        selected: withOpacity('#ffffff', 1),
      },
    },
    checkbox: {
      selected: {
        background: {
          default: withOpacity('#ffffff', 0.15000000596046448),
          hover: withOpacity('#ffffff', 0.25),
          pressed: withOpacity('#ffffff', 0.3499999940395355),
          selected: withOpacity('#ffffff', 1),
        },
        icon: {
          default: withOpacity('#272727', 0),
          hover: withOpacity('#272727', 0),
          pressed: withOpacity('#272727', 0),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
      },
    },
    radioButtons: {
      background: {
        default: withOpacity('#ffffff', 0.15000000596046448),
        hovered: withOpacity('#ffffff', 0.25),
        pressed: withOpacity('#ffffff', 0.3499999940395355),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0),
        pressed: withOpacity('#272727', 0),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
    },
    progressBar: {
      indeterminate: {
        background: {
          background: withOpacity('#000000', 0.10000000149011612),
        },
        fill: {
          stop1: withOpacity('#ffffff', 0.699999988079071),
          stop2: withOpacity('#ffffff', 0.8999999761581421),
          stop3: withOpacity('#ffffff', 0.699999988079071),
        },
      },
      determinate: {
        fill: {
          fill: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          background: withOpacity('#000000', 0.10000000149011612),
        },
      },
      quickReplies: {
        label: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.10000000149011612),
            pressed: withOpacity('#ffffff', 0.20000000298023224),
            selected: withOpacity('#ffffff', 0.8999999761581421),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
        dividers: withOpacity('#ffffff', 0.10000000149011612),
      },
    },
    menu: {
      title: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
      sectionHeader: withOpacity('#ffffff', 0.8999999761581421),
      subtitle: {
        default: withOpacity('#ffffff', 0.699999988079071),
        hovered: withOpacity('#ffffff', 0.699999988079071),
        pressed: withOpacity('#ffffff', 0.699999988079071),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      toggle: {
        title: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0),
            pressed: withOpacity('#ffffff', 0),
            selected: withOpacity('#ffffff', 0),
          },
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        subtitle: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          selected: withOpacity('#ffffff', 0.699999988079071),
        },
      },
      labelIcon: {
        label: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#ffffff', 0.699999988079071),
          hovered: withOpacity('#ffffff', 0.699999988079071),
          pressed: withOpacity('#ffffff', 0.699999988079071),
          selected: withOpacity('#272727', 0.8999999761581421),
        },
      },
    },
    sideNavigation: {
      sideNavItem: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#272727', 0.10000000149011612),
            pressed: withOpacity('#272727', 0.20000000298023224),
            selected: withOpacity('#272727', 1),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
      },
      label: {
        label: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
          selected: withOpacity('#272727', 1),
        },
        icon: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#ffffff', 0.8999999761581421),
          pressed: withOpacity('#ffffff', 0.8999999761581421),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        background: {
          fill: {
            default: withOpacity('#ffffff', 0),
            hovered: withOpacity('#ffffff', 0.10000000149011612),
            pressed: withOpacity('#ffffff', 0.20000000298023224),
            selected: withOpacity('#ffffff', 0),
          },
          border: {
            default: withOpacity('#000000', 0),
            hovered: withOpacity('#000000', 0),
            pressed: withOpacity('#000000', 0),
            selected: withOpacity('#000000', 0),
          },
        },
      },
    },
    badges: {
      primary: {
        background: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
      secondary: {
        background: withOpacity('#272727', 0.8999999761581421),
        label: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
      },
      positive: {
        background: withOpacity('#0b8a1b', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
      background: {
        background: withOpacity('#dd1535', 1),
        label: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    imageCards: {
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
          selected: withOpacity('#ffffff', 0),
        },
        border: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0),
          pressed: withOpacity('#ffffff', 0),
          selected: withOpacity('#ffffff', 0),
        },
      },
      label: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.699999988079071),
        metadata: withOpacity('#ffffff', 0.699999988079071),
        rating: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.699999988079071),
        },
        price: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.699999988079071),
        },
      },
      icon: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.699999988079071),
      },
    },
    tiles: {
      label: {
        onMedia: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.699999988079071),
        },
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.8999999761581421),
      },
      icon: {
        onMedia: {
          primary: withOpacity('#ffffff', 1),
        },
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.8999999761581421),
      },
      eventHeader: {
        label: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          month: withOpacity('#dd1535', 1),
          date: withOpacity('#272727', 1),
        },
        background: {
          primary: withOpacity('#000000', 0.6000000238418579),
          date: withOpacity('#ffffff', 0.8999999761581421),
        },
        notification: {
          indicator: withOpacity('#dd1535', 1),
        },
      },
      background: {
        primary: withOpacity('#000000', 0.10000000149011612),
      },
      mediaThumbnail: {
        border: withOpacity('#272727', 0.10000000149011612),
      },
      check: {
        background: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#272727', 1),
      },
    },
    segmentedControl: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      selected: {
        background: withOpacity('#000000', 0.10000000149011612),
      },
    },
    progressRing: {
      background: {
        active: withOpacity('#ffffff', 0.8999999761581421),
        inactive: withOpacity('#ffffff', 0.10000000149011612),
      },
      icon: {
        fill: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    avatar: {
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
      focusRing: {
        default: withOpacity('#272727', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
    },
    facepile: {
      label: withOpacity('#272727', 1),
    },
    peopleCard: {
      label: {
        secondary: withOpacity('#272727', 0.699999988079071),
        primary: withOpacity('#272727', 1),
        tertiary: withOpacity('#ffffff', 0.699999988079071),
      },
      badge: {
        active: withOpacity('#0b8a1b', 1),
      },
    },
    onMediaCheckbox: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0.20000000298023224),
        selected: withOpacity('#ffffff', 1),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
    },
    syncButton: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
      },
      progressRing: {
        background: withOpacity('#ffffff', 0.30000001192092896),
        fill: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    galleryTile: {
      icon: withOpacity('#ffffff', 1),
      label: withOpacity('#ffffff', 0.8999999761581421),
    },
    search: {
      label: withOpacity('#ffffff', 0.8999999761581421),
      cursor: withOpacity('#0173ec', 1),
      background: {
        default: withOpacity('#000000', 0.15000000596046448),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0.20000000298023224),
        typing: withOpacity('#000000', 0.15000000596046448),
      },
      icon: withOpacity('#272727', 1),
    },
    slider: {
      label: withOpacity('#ffffff', 0.699999988079071),
      background: withOpacity('#000000', 0.10000000149011612),
      icon: withOpacity('#ffffff', 0.8999999761581421),
      handle: {
        background: {
          hover: withOpacity('#000000', 0.10000000149011612),
          pressed: withOpacity('#000000', 0.20000000298023224),
          default: withOpacity('#000000', 0),
        },
        icon: withOpacity('#272727', 1),
        label: withOpacity('#272727', 1),
      },
      foreground: {
        default: withOpacity('#ffffff', 0.8999999761581421),
      },
    },
    typehead: {
      icon: withOpacity('#ffffff', 0.8999999761581421),
      label: withOpacity('#ffffff', 0.699999988079071),
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.15000000596046448),
      },
    },
    inputKeys: {
      letter: {
        background: {
          default: withOpacity('#ffffff', 0.05000000074505806),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
        },
        label: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.30000001192092896),
        },
      },
      icon: {
        background: {
          default: withOpacity('#ffffff', 0.05000000074505806),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
        icon: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
        },
      },
      alt: {
        background: {
          default: withOpacity('#414141', 1),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
        label: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.30000001192092896),
        },
      },
      primary: {
        background: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#5a5a5a', 1),
          pressed: withOpacity('#747474', 1),
        },
        icon: {
          default: withOpacity('#272727', 1),
          hovered: withOpacity('#272727', 1),
          pressed: withOpacity('#272727', 1),
        },
      },
      spaceBar: {
        background: {
          default: withOpacity('#ffffff', 0.05000000074505806),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
      },
    },
    controlBar: {
      background: {
        default: withOpacity('#414141', 1),
        spatialMinimized: {
          fill: withOpacity('#ffffff', 1),
          border: withOpacity('#ffffff', 1),
        },
      },
      label: withOpacity('#272727', 1),
    },
    inputKeyboard: {
      background: {
        fill: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
        },
        border: withOpacity('#ffffff', 0.10000000149011612),
      },
      dividers: withOpacity('#ffffff', 0.10000000149011612),
      label: withOpacity('#ffffff', 0.699999988079071),
    },
    tooltip: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: {
        default: withOpacity('#272727', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    infoCells: {
      background: withOpacity('#272727', 0.10000000149011612),
      icon: withOpacity('#272727', 0.699999988079071),
      subheadline: withOpacity('#ffffff', 0.699999988079071),
      label: withOpacity('#272727', 0.699999988079071),
    },
    listCells: {
      background: {
        default: withOpacity('#000000', 0.10000000149011612),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
        secondaryTextIcon: withOpacity('#272727', 0.699999988079071),
      },
      attribute: {
        primary: withOpacity('#272727', 1),
      },
    },
    auiNavigationBar: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      statusElements: {
        time: withOpacity('#272727', 0.699999988079071),
        wifi: withOpacity('#272727', 1),
        battery: withOpacity('#272727', 1),
      },
      divider: withOpacity('#ffffff', 0.10000000149011612),
    },
    achievementRow: {
      background: {
        default: withOpacity('#ffffff', 0),
      },
      label: {
        primary: withOpacity('#272727', 1),
        rating: withOpacity('#272727', 0.699999988079071),
        category: withOpacity('#272727', 0.699999988079071),
        description: withOpacity('#272727', 0.699999988079071),
        achievements: withOpacity('#272727', 0.699999988079071),
        progress: withOpacity('#272727', 1),
      },
      icon: {
        rating: withOpacity('#272727', 1),
      },
    },
    browserTab: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#272727', 1),
      },
    },
    browserToolBar: {
      icon: withOpacity('#272727', 0.699999988079071),
    },
    browserTopBar: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 1),
      },
      icon: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    dialogModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
        link: withOpacity('#0173ec', 1),
      },
      icon: {
        primary: withOpacity('#272727', 1),
      },
    },
    fullPanelModals: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    heroImage: {
      label: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.699999988079071),
      },
      pagination: {
        active: withOpacity('#ffffff', 0.8999999761581421),
        inactive: withOpacity('#ffffff', 0.30000001192092896),
      },
    },
    listHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    mediaControls: {
      icon: {
        icon: withOpacity('#ffffff', 0.8999999761581421),
        progressBar: {
          foreground: withOpacity('#ffffff', 0.8999999761581421),
          background: withOpacity('#ffffff', 0.30000001192092896),
        },
      },
      playButton: {
        background: withOpacity('#ffffff', 0.8999999761581421),
        icon: withOpacity('#272727', 0.8999999761581421),
      },
    },
    inputField: {
      label: withOpacity('#272727', 0.699999988079071),
      icon: withOpacity('#272727', 0.699999988079071),
      inputField: withOpacity('#272727', 0.05000000074505806),
      background: {
        default: withOpacity('#272727', 0.05000000074505806),
        hovered: withOpacity('#272727', 0.10000000149011612),
        pressed: withOpacity('#272727', 0.20000000298023224),
      },
    },
    popover: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      icon: withOpacity('#272727', 1),
    },
    sectionHeader: {
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
    },
    scrollbars: {
      background: {
        fill: withOpacity('#272727', 1),
      },
    },
    bottomButton: {
      label: {
        primary: withOpacity('#272727', 0.699999988079071),
        link: withOpacity('#0173ec', 1),
      },
    },
    sidesheet: {
      background: {
        stop1: withOpacity('#ffffff', 1),
        stop2: withOpacity('#f2f2f2', 1),
      },
      label: {
        primary: withOpacity('#272727', 1),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      divider: withOpacity('#ffffff', 0.10000000149011612),
    },
    toast: {
      toast: {
        background: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#f2f2f2', 1),
          delete: withOpacity('#dd1535', 1),
          label: {
            primary: withOpacity('#272727', 1),
            secondary: withOpacity('#272727', 0.699999988079071),
          },
          icon: {
            primary: withOpacity('#272727', 1),
          },
        },
        slider: {
          background: withOpacity('#000000', 0.10000000149011612),
          forground: withOpacity('#ffffff', 0.8999999761581421),
        },
      },
    },
    reactionPill: {
      background: {
        border: {
          stop1: withOpacity('#414141', 1),
          stop2: withOpacity('#272727', 1),
        },
        fill: withOpacity('#272727', 1),
      },
      label: withOpacity('#ffffff', 1),
    },
    chatBubble: {
      sender: {
        fill: withOpacity('#ffffff', 1),
        label: withOpacity('#272727', 1),
      },
      responder: {
        fill: withOpacity('#272727', 1),
        label: withOpacity('#ffffff', 1),
      },
    },
    avatarTile: {
      background: withOpacity('#000000', 0.10000000149011612),
      selectedBorder: withOpacity('#ffffff', 0.8999999761581421),
      label: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.699999988079071),
      },
      multiselect: {
        background: withOpacity('#ffffff', 1),
        icon: withOpacity('#272727', 1),
        border: withOpacity('#414141', 1),
      },
      icon: withOpacity('#ffffff', 0.8999999761581421),
      reward: {
        background: withOpacity('#000000', 0.10000000149011612),
        gradient: withOpacity('#6441d2', 1),
        label: {
          primary: withOpacity('#ffffff', 0.8999999761581421),
          secondary: withOpacity('#ffffff', 0.699999988079071),
        },
        slider: {
          background: withOpacity('#e2e4ea', 1),
          foreground: withOpacity('#6441d2', 1),
        },
        icon: withOpacity('#272727', 0.699999988079071),
      },
    },
    avatarSideNav: {
      background: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        selected: withOpacity('#ffffff', 0.8999999761581421),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
      attribute: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
    },
    avatarLoader: {
      fill: withOpacity('#ffffff', 0.8999999761581421),
      background: withOpacity('#ffffff', 0.10000000149011612),
    },
    avatarColorPickerSwatch: {
      selectedState: withOpacity('#ffffff', 0.8999999761581421),
      icon: withOpacity('#ffffff', 0.8999999761581421),
      noneBackground: withOpacity('#272727', 1),
    },
    avatarSlider: {
      label: withOpacity('#ffffff', 0.8999999761581421),
      icon: withOpacity('#ffffff', 0.699999988079071),
      slider: {
        background: withOpacity('#000000', 0.10000000149011612),
        label: withOpacity('#ffffff', 0.699999988079071),
        icon: withOpacity('#ffffff', 0.8999999761581421),
        foreground: {
          default: withOpacity('#ffffff', 0.8999999761581421),
        },
        handle: {
          icon: withOpacity('#272727', 1),
          label: withOpacity('#272727', 1),
        },
      },
      background: withOpacity('#000000', 0.10000000149011612),
    },
    avatarSectionHeader: {
      label: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#272727', 0.699999988079071),
      },
      icon: withOpacity('#ffffff', 0.8999999761581421),
    },
    avatarSegmentedControl: {
      background: {
        chips: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#ffffff', 0.8999999761581421),
        },
        picker: {
          default: withOpacity('#000000', 0.10000000149011612),
        },
      },
      icon: {
        default: withOpacity('#ffffff', 0.699999988079071),
        hovered: withOpacity('#ffffff', 0.800000011920929),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#272727', 1),
      },
      label: {
        default: withOpacity('#ffffff', 0.699999988079071),
        hovered: withOpacity('#ffffff', 0.699999988079071),
        pressed: withOpacity('#ffffff', 0.699999988079071),
        selected: withOpacity('#272727', 0.8999999761581421),
      },
      selected: {
        background: withOpacity('#000000', 0.10000000149011612),
      },
    },
    emptyStateIllustration: {
      icon: {
        primary: withOpacity('#ffffff', 0.5),
        secondary: withOpacity('#ffffff', 0.8999999761581421),
      },
      abstractStars: withOpacity('#ffffff', 0.15000000596046448),
      shimmer: withOpacity('#ffffff', 0.10000000149011612),
    },
    navigationOverflowMenu: {
      label: {
        default: withOpacity('#272727', 1),
        hovered: withOpacity('#272727', 1),
        pressed: withOpacity('#272727', 1),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        disabled: withOpacity('#ffffff', 0.10000000149011612),
      },
      icon: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hovered: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        selected: withOpacity('#ffffff', 0.8999999761581421),
        disabled: withOpacity('#ffffff', 0.10000000149011612),
      },
      background: {
        fill: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#272727', 0.10000000149011612),
          pressed: withOpacity('#272727', 0.20000000298023224),
          selected: withOpacity('#272727', 1),
          disabled: withOpacity('#272727', 0),
        },
        border: {
          default: withOpacity('#000000', 0),
          hovered: withOpacity('#000000', 0),
          pressed: withOpacity('#000000', 0),
          selected: withOpacity('#000000', 0),
        },
      },
    },
    navigationSystemBar: {
      elementsButton: {
        icon: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          green: withOpacity('#ffffff', 1),
          blue: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
        },
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
          withBadge: withOpacity('#ffffff', 1),
          withStatus: withOpacity('#ffffff', 1),
          privacyOn: withOpacity('#ffffff', 1),
          open: withOpacity('#ffffff', 1),
          recording: withOpacity('#ffffff', 1),
          number: withOpacity('#ffffff', 1),
          status: withOpacity('#ffffff', 1),
        },
        green: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        blue: {
          stop1: withOpacity('#ffffff', 1),
          stop2: withOpacity('#ffffff', 1),
          stop3: withOpacity('#ffffff', 1),
        },
        number: {
          label: withOpacity('#ffffff', 1),
        },
        badge: {
          fill: {
            privacyOn: withOpacity('#ffffff', 1),
            open: withOpacity('#ffffff', 1),
            recording: withOpacity('#ffffff', 1),
          },
        },
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
          pressed: withOpacity('#ffffff', 1),
          active: withOpacity('#ffffff', 1),
        },
      },
      personalDisplayBar: {
        chin: withOpacity('#ffffff', 1),
        defaultElementsButton: withOpacity('#ffffff', 1),
      },
      navigationChevron: {
        chevron: withOpacity('#ffffff', 1),
        fill: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      dividers: withOpacity('#ffffff', 1),
      time: withOpacity('#ffffff', 1),
      worldPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      appPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
        },
      },
      avatarPillButton: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
      },
      homeIcon: {
        background: {
          default: withOpacity('#ffffff', 1),
          hover: withOpacity('#ffffff', 1),
        },
        icon: withOpacity('#ffffff', 1),
      },
      sectionHeader: withOpacity('#ffffff', 1),
    },
    textInput: {
      label: {
        default: withOpacity('#ffffff', 0.8999999761581421),
        hover: withOpacity('#ffffff', 0.8999999761581421),
        pressed: withOpacity('#ffffff', 0.8999999761581421),
        typing: withOpacity('#ffffff', 1),
      },
      cursor: withOpacity('#0173ec', 1),
      icon: withOpacity('#ffffff', 0.699999988079071),
      background: {
        default: withOpacity('#ffffff', 0.05000000074505806),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0.20000000298023224),
        typing: withOpacity('#ffffff', 0.05000000074505806),
      },
    },
    navigationAppTile: {
      label: {
        primary: withOpacity('#ffffff', 1),
        secondary: withOpacity('#ffffff', 1),
      },
      attribute: withOpacity('#ffffff', 1),
      activeIndicator: withOpacity('#ffffff', 1),
      navigationUninstalledStates: {
        label: withOpacity('#ffffff', 1),
        iconButton: {
          download: {
            fill: withOpacity('#ffffff', 1),
            icon: withOpacity('#ffffff', 1),
          },
          queued: {
            stroke: withOpacity('#ffffff', 1),
          },
          queuedHover: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          cancel: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          downloadingProgress: {
            stroke: {
              inactiveStroke: withOpacity('#ffffff', 1),
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          installing: {
            stroke: {
              activeStroke: withOpacity('#ffffff', 1),
            },
          },
          redeem: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          view: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
          update: {
            icon: withOpacity('#ffffff', 1),
            fill: withOpacity('#ffffff', 1),
          },
        },
      },
      uninstalledScrim: withOpacity('#ffffff', 1),
    },
  },
  semantic: {
    ui: {
      focusring: {
        default: withOpacity('#ffffff', 0),
        hovered: withOpacity('#ffffff', 0.10000000149011612),
        pressed: withOpacity('#ffffff', 0.20000000298023224),
        selected: withOpacity('#ffffff', 0.699999988079071),
      },
      primary: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#ffffff', 0.8999999761581421),
          hovered: withOpacity('#d9d9d9', 1),
          pressed: withOpacity('#c0c0c0', 1),
        },
      },
      secondary: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#ffffff', 0.05000000074505806),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
      },
      tertiary: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.15000000596046448),
        },
      },
      disabled: {
        text: withOpacity('#8e8e8e', 1),
        icon: withOpacity('#8e8e8e', 1),
        background: {
          default: withOpacity('#5a5a5a', 1),
          hovered: withOpacity('#5a5a5a', 1),
          pressed: withOpacity('#5a5a5a', 1),
        },
      },
      selected: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#ffffff', 1),
          hovered: withOpacity('#f2f2f2', 1),
          pressed: withOpacity('#d9d9d9', 1),
        },
      },
      deselected: {
        text: withOpacity('#272727', 1),
        icon: withOpacity('#272727', 1),
        background: {
          default: withOpacity('#ffffff', 0.05000000074505806),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.15000000596046448),
        },
      },
      onMedia: {
        text: withOpacity('#f2f2f2', 1),
        icon: withOpacity('#f2f2f2', 1),
        background: {
          default: withOpacity('#ffffff', 0),
          hovered: withOpacity('#ffffff', 0.10000000149011612),
          pressed: withOpacity('#ffffff', 0.20000000298023224),
        },
      },
    },
    status: {
      notification: withOpacity('#64b5ff', 1),
      hidden: withOpacity('#8e8e8e', 1),
      positive: withOpacity('#2ad116', 1),
      negative: withOpacity('#f7818c', 1),
      warning: withOpacity('#fc9435', 1),
      privacy: withOpacity('#9c94f8', 1),
    },
    text: {
      primary: withOpacity('#ffffff', 0.8999999761581421),
      secondary: withOpacity('#ffffff', 0.699999988079071),
      placeholder: withOpacity('#ffffff', 0.30000001192092896),
      disabled: withOpacity('#ffffff', 0.30000001192092896),
      link: withOpacity('#64b5ff', 1),
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      warning: withOpacity('#a94302', 1),
      primaryOnMedia: withOpacity('#ffffff', 0.8999999761581421),
      secondaryOnMedia: withOpacity('#ffffff', 0.699999988079071),
    },
    icon: {
      primary: withOpacity('#ffffff', 0.8999999761581421),
      secondary: withOpacity('#ffffff', 0.699999988079071),
      placeholder: withOpacity('#ffffff', 0.30000001192092896),
      disabled: withOpacity('#ffffff', 0.30000001192092896),
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      warning: withOpacity('#a94302', 1),
      onMedia: withOpacity('#ffffff', 0.8999999761581421),
      secondaryOnMedia: withOpacity('#ffffff', 0.699999988079071),
    },
    background: {
      primary: {
        stop1: withOpacity('#414141', 1),
        stop2: withOpacity('#272727', 1),
      },
      positive: withOpacity('#0b8a1b', 1),
      negative: withOpacity('#dd1535', 1),
      privacy: withOpacity('#6441d2', 1),
      ui: {
        primary: withOpacity('#ffffff', 0.8999999761581421),
        secondary: withOpacity('#ffffff', 0.05000000074505806),
      },
    },
    shadows: {
      punchedIn: {
        dropShadow: withOpacity('#ffffff', 0.10000000149011612),
        innerShadow: withOpacity('#000000', 0.10000000149011612),
      },
      beveled: {
        left: withOpacity('#ffffff', 0.10000000149011612),
        right: withOpacity('#000000', 0.10000000149011612),
      },
      dropShadow: {
        innerShadow: {
          left: withOpacity('#ffffff', 0.10000000149011612),
          right: withOpacity('#000000', 0.10000000149011612),
        },
        dropShadow: {
          top: withOpacity('#000000', 0.10000000149011612),
          bottom: withOpacity('#000000', 0.20000000298023224),
        },
      },
      panel: {
        innerShadow: withOpacity('#000000', 0.10000000149011612),
        innerShadow2: withOpacity('#ffffff', 0.10000000149011612),
      },
    },
  },
} as const
